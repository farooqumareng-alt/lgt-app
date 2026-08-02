"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { PriceBreakSchema } from "@/lib/validation/admin-products";

export type PriceBreakActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

export async function createPriceBreak(
  productId: string,
  _prevState: PriceBreakActionResult | undefined,
  formData: FormData,
): Promise<PriceBreakActionResult> {
  await requireRole("ADMIN");
  const parsed = PriceBreakSchema.safeParse({
    minQuantity: formData.get("minQuantity"),
    price: formData.get("price"),
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.wholesalePriceBreak.findUnique({
    where: { productId_minQuantity: { productId, minQuantity: parsed.data.minQuantity } },
  });
  if (existing) {
    return { success: false, message: "A price break for this quantity already exists." };
  }

  await prisma.wholesalePriceBreak.create({
    data: { productId, minQuantity: parsed.data.minQuantity, price: parsed.data.price },
  });

  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true };
}

export async function deletePriceBreak(priceBreakId: string) {
  await requireRole("ADMIN");
  const priceBreak = await prisma.wholesalePriceBreak.delete({ where: { id: priceBreakId } });
  revalidatePath(`/admin/products/${priceBreak.productId}/edit`);
}
