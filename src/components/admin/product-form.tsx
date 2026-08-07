"use client";

import { useActionState, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductActionResult } from "@/server/actions/admin-products";
import { generateAdminProductImageAnalysis, generateProductListingCopy } from "@/server/actions/admin-ai";

type Category = { id: string; name: string };
type ProductImageRef = { url: string; altText: string };

type ProductFormValues = {
  name?: string;
  slug?: string;
  sku?: string;
  categoryId?: string;
  shortDescription?: string | null;
  description?: string;
  materials?: string[];
  dimensions?: string | null;
  careInstructions?: string | null;
  isCustomizable?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  basePriceRetail?: number | string;
  basePriceWholesale?: number | string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

type ProductFormAction = (
  prevState: ProductActionResult | undefined,
  formData: FormData,
) => Promise<ProductActionResult>;

export function ProductForm({
  action,
  categories,
  defaultValues,
  submitLabel = "Save Product",
  productImages = [],
}: {
  action: ProductFormAction;
  categories: Category[];
  defaultValues?: ProductFormValues;
  submitLabel?: string;
  /** Only ever populated on the edit page — a brand-new product has no uploaded photos yet. */
  productImages?: ProductImageRef[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const materialsRef = useRef<HTMLInputElement>(null);
  const isCustomizableRef = useRef<HTMLInputElement>(null);
  const shortDescriptionRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const metaTitleRef = useRef<HTMLInputElement>(null);
  const metaDescriptionRef = useRef<HTMLInputElement>(null);

  const [isGenerating, startGenerating] = useTransition();
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  function handleGenerateCopy() {
    setAiMessage(null);
    const categorySelect = formRef.current?.elements.namedItem("categoryId") as HTMLSelectElement | null;
    const categoryName = categorySelect?.selectedOptions[0]?.text ?? "";

    startGenerating(async () => {
      const result = await generateProductListingCopy({
        name: nameRef.current?.value ?? "",
        categoryName,
        materials: materialsRef.current?.value ?? "",
        isCustomizable: isCustomizableRef.current?.checked ?? false,
      });
      if (!result.success) {
        setAiMessage(result.message);
        return;
      }
      if (shortDescriptionRef.current) shortDescriptionRef.current.value = result.copy.shortDescription;
      if (descriptionRef.current) descriptionRef.current.value = result.copy.description;
      if (metaTitleRef.current) metaTitleRef.current.value = result.copy.metaTitle;
      if (metaDescriptionRef.current) metaDescriptionRef.current.value = result.copy.metaDescription;
      setAiMessage("Generated — review and edit before saving.");
    });
  }

  const [selectedImageUrl, setSelectedImageUrl] = useState(productImages[0]?.url ?? "");
  const [isAnalyzingImage, startAnalyzingImage] = useTransition();
  const [imageAnalysisMessage, setImageAnalysisMessage] = useState<string | null>(null);
  const [imageFeedback, setImageFeedback] = useState<string | null>(null);

  function handleAnalyzeImage() {
    if (!selectedImageUrl) return;
    setImageAnalysisMessage(null);
    setImageFeedback(null);
    const categorySelect = formRef.current?.elements.namedItem("categoryId") as HTMLSelectElement | null;
    const categoryName = categorySelect?.selectedOptions[0]?.text ?? "";

    startAnalyzingImage(async () => {
      const result = await generateAdminProductImageAnalysis({
        imageUrl: selectedImageUrl,
        productName: nameRef.current?.value ?? "",
        categoryName,
      });
      if (!result.success) {
        setImageAnalysisMessage(result.message);
        return;
      }
      if (shortDescriptionRef.current) shortDescriptionRef.current.value = result.result.shortDescription;
      if (descriptionRef.current) descriptionRef.current.value = result.result.description;
      if (materialsRef.current) materialsRef.current.value = result.result.suggestedMaterials;
      setImageFeedback(result.result.imageFeedback);
      setImageAnalysisMessage("Filled from the photo — review and edit before saving.");
    });
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <Input id="name" name="name" ref={nameRef} defaultValue={defaultValues?.name ?? ""} required />
          {errors?.name && <p className="text-sm text-saddle-700">{errors.name[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="slug">
            Slug (leave blank to auto-generate)
          </label>
          <Input id="slug" name="slug" defaultValue={defaultValues?.slug ?? ""} />
          {errors?.slug && <p className="text-sm text-saddle-700">{errors.slug[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="sku">
            SKU
          </label>
          <Input id="sku" name="sku" defaultValue={defaultValues?.sku ?? ""} required />
          {errors?.sku && <p className="text-sm text-saddle-700">{errors.sku[0]}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="categoryId">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={defaultValues?.categoryId ?? ""}
            required
            className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors?.categoryId && <p className="text-sm text-saddle-700">{errors.categoryId[0]}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Listing copy</p>
            <Button type="button" variant="secondary" loading={isGenerating} onClick={handleGenerateCopy}>
              {isGenerating ? "Generating…" : "Generate with AI"}
            </Button>
          </div>
          {aiMessage && <p className="mt-1 text-xs text-ink/70">{aiMessage}</p>}
        </div>

        {productImages.length > 0 && (
          <div className="space-y-2 rounded-sm border border-cream-200 bg-cream-50 p-3 sm:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Analyze a product photo</p>
              <div className="flex items-center gap-2">
                {productImages.length > 1 && (
                  <select
                    value={selectedImageUrl}
                    onChange={(e) => setSelectedImageUrl(e.target.value)}
                    className="rounded-sm border border-cream-300 bg-cream-50 px-2 py-1.5 text-xs text-ink"
                  >
                    {productImages.map((image, i) => (
                      <option key={image.url} value={image.url}>
                        Photo {i + 1}
                      </option>
                    ))}
                  </select>
                )}
                <Button type="button" variant="secondary" loading={isAnalyzingImage} onClick={handleAnalyzeImage}>
                  {isAnalyzingImage ? "Analyzing…" : "Analyze Photo & Fill"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-ink/60">
              Reads the selected photo and fills the short description, description, and materials
              fields below from what&apos;s actually visible — plus honest feedback on the photo
              itself.
            </p>
            {imageAnalysisMessage && <p className="text-xs text-ink/70">{imageAnalysisMessage}</p>}
            {imageFeedback && (
              <div className="rounded-sm bg-cream-100 p-2 text-xs text-ink/80">
                <span className="font-medium text-ink">Photo feedback: </span>
                {imageFeedback}
              </div>
            )}
          </div>
        )}

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="shortDescription">
            Short description (optional)
          </label>
          <Input
            id="shortDescription"
            name="shortDescription"
            ref={shortDescriptionRef}
            defaultValue={defaultValues?.shortDescription ?? ""}
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            ref={descriptionRef}
            rows={4}
            defaultValue={defaultValues?.description ?? ""}
            required
            className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
          />
          {errors?.description && <p className="text-sm text-saddle-700">{errors.description[0]}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="materials">
            Materials (comma-separated)
          </label>
          <Input
            ref={materialsRef}
            id="materials"
            name="materials"
            defaultValue={defaultValues?.materials?.join(", ") ?? ""}
            placeholder="Full-grain leather, brass hardware"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="dimensions">
            Dimensions (optional)
          </label>
          <Input
            id="dimensions"
            name="dimensions"
            defaultValue={defaultValues?.dimensions ?? ""}
            placeholder='8&quot; W x 4&quot; H x 1&quot; D'
          />
          {errors?.dimensions && <p className="text-sm text-saddle-700">{errors.dimensions[0]}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="careInstructions">
            Care instructions (optional)
          </label>
          <textarea
            id="careInstructions"
            name="careInstructions"
            rows={3}
            defaultValue={defaultValues?.careInstructions ?? ""}
            placeholder="Condition every 3-6 months. Keep away from prolonged water exposure. Store away from direct sunlight."
            className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
          />
          {errors?.careInstructions && <p className="text-sm text-saddle-700">{errors.careInstructions[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="basePriceRetail">
            Retail price ($)
          </label>
          <Input
            id="basePriceRetail"
            name="basePriceRetail"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.basePriceRetail ?? ""}
            required
          />
          {errors?.basePriceRetail && <p className="text-sm text-saddle-700">{errors.basePriceRetail[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="basePriceWholesale">
            Wholesale price ($, optional — leave blank to keep retail-only)
          </label>
          <Input
            id="basePriceWholesale"
            name="basePriceWholesale"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.basePriceWholesale ?? ""}
          />
          {errors?.basePriceWholesale && (
            <p className="text-sm text-saddle-700">{errors.basePriceWholesale[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="metaTitle">
            Meta title (optional)
          </label>
          <Input id="metaTitle" name="metaTitle" ref={metaTitleRef} defaultValue={defaultValues?.metaTitle ?? ""} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="metaDescription">
            Meta description (optional)
          </label>
          <Input
            id="metaDescription"
            name="metaDescription"
            ref={metaDescriptionRef}
            defaultValue={defaultValues?.metaDescription ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={defaultValues?.isActive ?? true} />
          Active (visible on the storefront)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={defaultValues?.isFeatured ?? false} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isCustomizable"
            ref={isCustomizableRef}
            defaultChecked={defaultValues?.isCustomizable ?? false}
          />
          Customizable
        </label>
      </div>

      {state && !state.success && state.message && (
        <p className="text-sm text-saddle-700">{state.message}</p>
      )}

      <Button type="submit" loading={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
