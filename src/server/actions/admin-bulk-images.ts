"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export type BulkImageResult = {
  fileName: string;
  status: "uploaded" | "unmatched" | "error";
  matchedSku?: string;
  message?: string;
};

/**
 * Matches each file to a product by SKU prefix in the filename (e.g.
 * "BLT-001-front.jpg" or "BLT-001.jpg" both match SKU "BLT-001"). Matches
 * the longest SKU that's a genuine prefix (not just a substring) so a SKU
 * like "BLT-001" doesn't wrongly match a file for "BLT-0010".
 */
export async function bulkUploadProductImages(formData: FormData): Promise<{ results: BulkImageResult[] }> {
  await requireRole("ADMIN");

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { results: [] };
  }

  const products = await prisma.product.findMany({ select: { id: true, sku: true } });
  const skusByLengthDesc = [...products].sort((a, b) => b.sku.length - a.sku.length);

  const results: BulkImageResult[] = [];
  const primaryAlreadySet = new Map<string, boolean>();

  for (const file of files) {
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const match = skusByLengthDesc.find(
      (p) => baseName === p.sku || baseName.startsWith(p.sku) && !/^[a-zA-Z0-9]/.test(baseName.slice(p.sku.length)),
    );

    if (!match) {
      results.push({ fileName: file.name, status: "unmatched", message: "No product SKU matched this filename." });
      continue;
    }
    if (!file.type.startsWith("image/")) {
      results.push({ fileName: file.name, status: "error", matchedSku: match.sku, message: "Not an image file." });
      continue;
    }
    if (file.size > 8 * 1024 * 1024) {
      results.push({ fileName: file.name, status: "error", matchedSku: match.sku, message: "File exceeds 8MB." });
      continue;
    }

    try {
      const blob = await put(`products/${match.id}/${Date.now()}-${file.name}`, file, { access: "public" });

      let isPrimary = primaryAlreadySet.get(match.id);
      if (isPrimary === undefined) {
        const existingCount = await prisma.productImage.count({ where: { productId: match.id } });
        isPrimary = existingCount === 0;
      }

      await prisma.productImage.create({
        data: {
          productId: match.id,
          url: blob.url,
          altText: `${match.sku} product photo`,
          isPrimary,
        },
      });
      primaryAlreadySet.set(match.id, false); // only the first upload per product per batch becomes primary

      results.push({ fileName: file.name, status: "uploaded", matchedSku: match.sku });
    } catch (error) {
      results.push({
        fileName: file.name,
        status: "error",
        matchedSku: match.sku,
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    }
  }

  revalidatePath("/admin/products");
  return { results };
}
