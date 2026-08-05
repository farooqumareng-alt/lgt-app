"use server";

import { requireRole } from "@/lib/dal";
import { generateListingCopy, type ListingCopy } from "@/lib/ai";

export type GenerateListingCopyResult = { success: true; copy: ListingCopy } | { success: false; message: string };

export async function generateProductListingCopy(input: {
  name: string;
  categoryName: string;
  materials: string;
  isCustomizable: boolean;
}): Promise<GenerateListingCopyResult> {
  await requireRole("ADMIN");

  if (!input.name.trim()) {
    return { success: false, message: "Enter a product name first." };
  }
  if (!input.categoryName.trim()) {
    return { success: false, message: "Select a category first." };
  }

  try {
    const copy = await generateListingCopy(input);
    return { success: true, copy };
  } catch (error) {
    console.error("generateProductListingCopy failed:", error);
    return { success: false, message: "AI generation failed — please try again or write the copy manually." };
  }
}
