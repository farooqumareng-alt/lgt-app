"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { generateProductImage } from "@/lib/image-gen";
import { prisma } from "@/lib/prisma";

export type GenerateImageResult = { success: true } | { success: false; message: string };

function buildPrompt(input: { name: string; categoryName: string; materials: string }): string {
  return (
    `Professional product photograph of a ${input.categoryName.toLowerCase().replace(/s$/, "")} ` +
    `called "${input.name}", made from ${input.materials || "genuine leather"}. ` +
    "Shot on a plain neutral cream/beige studio background, soft even lighting, centered, no text, no logos, no watermarks, no people. " +
    "Photorealistic, high detail on stitching and leather grain."
  );
}

export async function generatePlaceholderProductImage(
  productId: string,
  input: { name: string; categoryName: string; materials: string },
): Promise<GenerateImageResult> {
  await requireRole("ADMIN");

  try {
    const prompt = buildPrompt(input);
    const result = await generateProductImage({ prompt });

    const blob = await put(`products/${productId}/ai-placeholder-${Date.now()}.png`, result.imageBuffer, {
      access: "public",
      contentType: result.contentType,
    });

    const existingCount = await prisma.productImage.count({ where: { productId } });
    await prisma.productImage.create({
      data: {
        productId,
        url: blob.url,
        altText: `${input.name} — AI-generated placeholder photo, not the actual product`,
        isPrimary: existingCount === 0,
        sortOrder: existingCount,
        isAiGenerated: true,
      },
    });

    revalidatePath(`/admin/products/${productId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("generatePlaceholderProductImage failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Image generation failed.",
    };
  }
}
