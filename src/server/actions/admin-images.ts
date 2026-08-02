"use server";

import { revalidatePath } from "next/cache";
import { del, put } from "@vercel/blob";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export type ImageActionResult =
  | { success: true }
  | { success: false; message?: string };

export async function uploadProductImage(
  productId: string,
  _prevState: ImageActionResult | undefined,
  formData: FormData,
): Promise<ImageActionResult> {
  await requireRole("ADMIN");

  const file = formData.get("file");
  const altText = (formData.get("altText") as string | null)?.trim();

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Please choose an image file." };
  }
  if (!altText) {
    return { success: false, message: "Alt text is required for every product image." };
  }

  const blob = await put(`products/${productId}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  const existingCount = await prisma.productImage.count({ where: { productId } });
  await prisma.productImage.create({
    data: {
      productId,
      url: blob.url,
      altText,
      sortOrder: existingCount,
      isPrimary: existingCount === 0,
    },
  });

  revalidatePath(`/admin/products/${productId}/edit`);
  return { success: true };
}

export async function deleteProductImage(imageId: string) {
  await requireRole("ADMIN");
  const image = await prisma.productImage.delete({ where: { id: imageId } });
  await del(image.url).catch(() => {});
  revalidatePath(`/admin/products/${image.productId}/edit`);
}

export async function setImagePrimary(imageId: string) {
  await requireRole("ADMIN");
  const image = await prisma.productImage.findUnique({ where: { id: imageId }, select: { productId: true } });
  if (!image) return;

  await prisma.$transaction([
    prisma.productImage.updateMany({ where: { productId: image.productId }, data: { isPrimary: false } }),
    prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);

  revalidatePath(`/admin/products/${image.productId}/edit`);
}
