"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ProductSchema } from "@/lib/validation/admin-products";

export type ProductActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseProductForm(formData: FormData) {
  return ProductSchema.safeParse({
    name: formData.get("name"),
    slug: (formData.get("slug") as string)?.trim() || slugify(String(formData.get("name") ?? "")),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    materials: formData.get("materials"),
    isCustomizable: formData.get("isCustomizable") === "on",
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    basePriceRetail: formData.get("basePriceRetail"),
    basePriceWholesale: formData.get("basePriceWholesale"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
  });
}

export async function createProduct(
  _prevState: ProductActionResult | undefined,
  formData: FormData,
): Promise<ProductActionResult> {
  await requireRole("ADMIN");
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const [slugExists, skuExists] = await Promise.all([
    prisma.product.findUnique({ where: { slug: parsed.data.slug } }),
    prisma.product.findUnique({ where: { sku: parsed.data.sku } }),
  ]);
  if (slugExists) return { success: false, errors: { slug: ["This slug is already in use."] } };
  if (skuExists) return { success: false, errors: { sku: ["This SKU is already in use."] } };

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      sku: parsed.data.sku,
      categoryId: parsed.data.categoryId,
      shortDescription: parsed.data.shortDescription || null,
      description: parsed.data.description,
      materials: parsed.data.materials
        ? parsed.data.materials.split(",").map((m) => m.trim()).filter(Boolean)
        : [],
      isCustomizable: parsed.data.isCustomizable,
      isActive: parsed.data.isActive,
      isFeatured: parsed.data.isFeatured,
      basePriceRetail: parsed.data.basePriceRetail,
      basePriceWholesale: parsed.data.basePriceWholesale,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
    },
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProduct(
  productId: string,
  _prevState: ProductActionResult | undefined,
  formData: FormData,
): Promise<ProductActionResult> {
  await requireRole("ADMIN");
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const [slugConflict, skuConflict] = await Promise.all([
    prisma.product.findFirst({ where: { slug: parsed.data.slug, id: { not: productId } } }),
    prisma.product.findFirst({ where: { sku: parsed.data.sku, id: { not: productId } } }),
  ]);
  if (slugConflict) return { success: false, errors: { slug: ["This slug is already in use."] } };
  if (skuConflict) return { success: false, errors: { sku: ["This SKU is already in use."] } };

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      sku: parsed.data.sku,
      categoryId: parsed.data.categoryId,
      shortDescription: parsed.data.shortDescription || null,
      description: parsed.data.description,
      materials: parsed.data.materials
        ? parsed.data.materials.split(",").map((m) => m.trim()).filter(Boolean)
        : [],
      isCustomizable: parsed.data.isCustomizable,
      isActive: parsed.data.isActive,
      isFeatured: parsed.data.isFeatured,
      basePriceRetail: parsed.data.basePriceRetail,
      basePriceWholesale: parsed.data.basePriceWholesale,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true };
}

export async function toggleProductActive(productId: string) {
  await requireRole("ADMIN");
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { isActive: true } });
  if (!product) return;

  await prisma.product.update({ where: { id: productId }, data: { isActive: !product.isActive } });
  revalidatePath("/admin/products");
}
