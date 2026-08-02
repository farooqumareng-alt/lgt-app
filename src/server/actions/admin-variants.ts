"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { VariantSchema } from "@/lib/validation/admin-products";

export type VariantActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

function parseVariantForm(formData: FormData) {
  return VariantSchema.safeParse({
    sku: formData.get("sku"),
    color: formData.get("color"),
    size: formData.get("size"),
    material: formData.get("material"),
    priceRetailOverride: formData.get("priceRetailOverride"),
    priceWholesaleOverride: formData.get("priceWholesaleOverride"),
    stockQuantity: formData.get("stockQuantity"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createVariant(
  productId: string,
  _prevState: VariantActionResult | undefined,
  formData: FormData,
): Promise<VariantActionResult> {
  await requireRole("ADMIN");
  const parsed = parseVariantForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const skuExists = await prisma.productVariant.findUnique({ where: { sku: parsed.data.sku } });
  if (skuExists) return { success: false, errors: { sku: ["This SKU is already in use."] } };

  await prisma.productVariant.create({
    data: {
      productId,
      sku: parsed.data.sku,
      color: parsed.data.color || null,
      size: parsed.data.size || null,
      material: parsed.data.material || null,
      priceRetailOverride: parsed.data.priceRetailOverride,
      priceWholesaleOverride: parsed.data.priceWholesaleOverride,
      stockQuantity: parsed.data.stockQuantity,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true };
}

export async function updateVariant(
  variantId: string,
  _prevState: VariantActionResult | undefined,
  formData: FormData,
): Promise<VariantActionResult> {
  await requireRole("ADMIN");
  const parsed = parseVariantForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const skuConflict = await prisma.productVariant.findFirst({
    where: { sku: parsed.data.sku, id: { not: variantId } },
  });
  if (skuConflict) return { success: false, errors: { sku: ["This SKU is already in use."] } };

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      sku: parsed.data.sku,
      color: parsed.data.color || null,
      size: parsed.data.size || null,
      material: parsed.data.material || null,
      priceRetailOverride: parsed.data.priceRetailOverride,
      priceWholesaleOverride: parsed.data.priceWholesaleOverride,
      stockQuantity: parsed.data.stockQuantity,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath(`/admin/products/${variant.productId}/edit`);
  return { success: true };
}

export async function toggleVariantActive(variantId: string) {
  await requireRole("ADMIN");
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { isActive: true, productId: true },
  });
  if (!variant) return;

  await prisma.productVariant.update({ where: { id: variantId }, data: { isActive: !variant.isActive } });
  revalidatePath(`/admin/products/${variant.productId}/edit`);
}
