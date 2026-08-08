"use client";

import { type RefObject, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { generateAdminProductImageAnalysis, generateProductListingCopy } from "@/server/actions/admin-ai";

type ProductImageRef = { url: string; altText: string };

type FieldRefs = {
  nameRef: RefObject<HTMLInputElement | null>;
  materialsRef: RefObject<HTMLInputElement | null>;
  isCustomizableRef: RefObject<HTMLInputElement | null>;
  shortDescriptionRef: RefObject<HTMLInputElement | null>;
  descriptionRef: RefObject<HTMLTextAreaElement | null>;
  metaTitleRef: RefObject<HTMLInputElement | null>;
  metaDescriptionRef: RefObject<HTMLInputElement | null>;
};

// One button, one mental model: "figure out this listing for me." Previously
// this was two separate buttons (a text-only generator and a photo analyzer)
// sitting a few pixels apart, writing into the same fields with no
// indication of which one an admin should reach for. Now there's a single
// action that uses whatever's actually available — a real photo if one's
// been uploaded (more accurate, since it describes what's really there),
// text-only otherwise — and the caller finds out which fields changed so it
// can mark them for review.
export function ProductAiPanel({
  refs,
  formRef,
  productImages,
  selectedImageUrl,
  onSelectImage,
  onFilled,
}: {
  refs: FieldRefs;
  formRef: RefObject<HTMLFormElement | null>;
  productImages: ProductImageRef[];
  selectedImageUrl: string;
  onSelectImage: (url: string) => void;
  onFilled: (fields: string[]) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [imageFeedback, setImageFeedback] = useState<string | null>(null);

  const hasPhoto = productImages.length > 0 && !!selectedImageUrl;

  function handleGenerate() {
    setMessage(null);
    setImageFeedback(null);
    const { nameRef, materialsRef, isCustomizableRef, shortDescriptionRef, descriptionRef, metaTitleRef, metaDescriptionRef } =
      refs;
    const categorySelect = formRef.current?.elements.namedItem("categoryId") as HTMLSelectElement | null;
    const categoryName = categorySelect?.selectedOptions[0]?.text ?? "";

    startTransition(async () => {
      if (hasPhoto) {
        const result = await generateAdminProductImageAnalysis({
          imageUrl: selectedImageUrl,
          productName: nameRef.current?.value ?? "",
          categoryName,
        });
        if (!result.success) {
          setMessage(result.message);
          return;
        }
        if (shortDescriptionRef.current) shortDescriptionRef.current.value = result.result.shortDescription;
        if (descriptionRef.current) descriptionRef.current.value = result.result.description;
        if (materialsRef.current) materialsRef.current.value = result.result.suggestedMaterials;
        if (metaTitleRef.current) metaTitleRef.current.value = result.result.metaTitle;
        if (metaDescriptionRef.current) metaDescriptionRef.current.value = result.result.metaDescription;
        setImageFeedback(result.result.imageFeedback);
        onFilled(["shortDescription", "description", "materials", "metaTitle", "metaDescription"]);
        setMessage("Filled from the photo — review before saving.");
        return;
      }

      const result = await generateProductListingCopy({
        name: nameRef.current?.value ?? "",
        categoryName,
        materials: materialsRef.current?.value ?? "",
        isCustomizable: isCustomizableRef.current?.checked ?? false,
      });
      if (!result.success) {
        setMessage(result.message);
        return;
      }
      if (shortDescriptionRef.current) shortDescriptionRef.current.value = result.copy.shortDescription;
      if (descriptionRef.current) descriptionRef.current.value = result.copy.description;
      if (metaTitleRef.current) metaTitleRef.current.value = result.copy.metaTitle;
      if (metaDescriptionRef.current) metaDescriptionRef.current.value = result.copy.metaDescription;
      onFilled(["shortDescription", "description", "metaTitle", "metaDescription"]);
      setMessage("Generated from the product name and category — review before saving, then add real photos.");
    });
  }

  return (
    <div className="space-y-2 rounded-sm border border-cream-200 bg-cream-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">✨ Analyze Product &amp; Generate Listing</p>
          <p className="text-xs text-ink/60">
            {hasPhoto
              ? "Reads the selected photo below and fills the description, materials, and SEO fields from what's actually visible."
              : "No photo yet, so this drafts from the product name and category instead — add a real photo for a more accurate result."}
          </p>
        </div>
        {productImages.length > 1 && (
          <select
            value={selectedImageUrl}
            onChange={(e) => onSelectImage(e.target.value)}
            className="rounded-sm border border-cream-300 bg-cream-50 px-2 py-1.5 text-xs text-ink"
          >
            {productImages.map((image, i) => (
              <option key={image.url} value={image.url}>
                Photo {i + 1}
              </option>
            ))}
          </select>
        )}
      </div>
      <Button type="button" variant="secondary" loading={isPending} onClick={handleGenerate}>
        {isPending ? "Analyzing…" : "✨ Analyze Product & Generate Listing"}
      </Button>
      {message && <p className="text-xs text-ink/70">{message}</p>}
      {imageFeedback && (
        <div className="rounded-sm bg-cream-100 p-2 text-xs text-ink/80">
          <span className="font-medium text-ink">Photo feedback: </span>
          {imageFeedback}
        </div>
      )}
    </div>
  );
}
