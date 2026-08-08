"use client";

import { useActionState, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProductAiPanel } from "@/components/admin/product-ai-panel";
import type { ProductActionResult } from "@/server/actions/admin-products";

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

/** Small "this came from AI, review it" marker — shown next to a field's label right after the panel fills it. */
function AiSuggestedTag({ show }: { show: boolean }) {
  if (!show) return null;
  return <span className="ml-2 text-xs font-normal text-saddle">✨ AI suggested — review</span>;
}

export function ProductForm({
  action,
  categories,
  defaultValues,
  submitLabel = "Save Product",
  productImages = [],
  isNew = false,
  formId = "product-form",
}: {
  action: ProductFormAction;
  categories: Category[];
  defaultValues?: ProductFormValues;
  submitLabel?: string;
  /** Only ever populated on the edit page — a brand-new product has no uploaded photos yet. */
  productImages?: ProductImageRef[];
  /** New-product mode: shows an inline photo picker since there's no edit-page Images section to send admins to yet. */
  isNew?: boolean;
  /** Lets a sticky header outside this form submit it via the button's `form` attribute. */
  formId?: string;
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

  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  const [selectedImageUrl, setSelectedImageUrl] = useState(productImages[0]?.url ?? "");
  const [selectedImageCount, setSelectedImageCount] = useState(0);

  return (
    <form ref={formRef} id={formId} action={formAction} className="space-y-6">
      {isNew && (
        <Card className="space-y-2 p-5">
          <p className="text-sm font-medium">Images (optional)</p>
          <p className="text-xs text-ink/60">
            Attach photos now instead of coming back after saving. Alt text is generated from the product
            name — refine it anytime from the edit page&apos;s Images section.
          </p>
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            onChange={(e) => setSelectedImageCount(e.target.files?.length ?? 0)}
            className="block text-sm"
          />
          {selectedImageCount > 0 && (
            <p className="text-xs text-ink/70">
              {selectedImageCount} image{selectedImageCount === 1 ? "" : "s"} selected — the first becomes
              the primary photo.
            </p>
          )}
        </Card>
      )}

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-lg">Basic Information</h2>
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
        </div>
      </Card>

      <Card className="p-5">
        <ProductAiPanel
          refs={{ nameRef, materialsRef, isCustomizableRef, shortDescriptionRef, descriptionRef, metaTitleRef, metaDescriptionRef }}
          formRef={formRef}
          productImages={productImages}
          selectedImageUrl={selectedImageUrl}
          onSelectImage={setSelectedImageUrl}
          onFilled={(fields) => setAiFilledFields(new Set(fields))}
        />
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-lg">Description</h2>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="shortDescription">
            Short description (optional)
            <AiSuggestedTag show={aiFilledFields.has("shortDescription")} />
          </label>
          <Input
            id="shortDescription"
            name="shortDescription"
            ref={shortDescriptionRef}
            defaultValue={defaultValues?.shortDescription ?? ""}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="description">
            Description
            <AiSuggestedTag show={aiFilledFields.has("description")} />
          </label>
          <textarea
            id="description"
            name="description"
            ref={descriptionRef}
            rows={5}
            defaultValue={defaultValues?.description ?? ""}
            required
            className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
          />
          {errors?.description && <p className="text-sm text-saddle-700">{errors.description[0]}</p>}
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-lg">Product Details</h2>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="materials">
            Materials (comma-separated)
            <AiSuggestedTag show={aiFilledFields.has("materials")} />
          </label>
          <Input
            ref={materialsRef}
            id="materials"
            name="materials"
            defaultValue={defaultValues?.materials?.join(", ") ?? ""}
            placeholder="Full-grain leather, brass hardware"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="careInstructions">
              Care instructions (optional)
            </label>
            <textarea
              id="careInstructions"
              name="careInstructions"
              rows={3}
              defaultValue={defaultValues?.careInstructions ?? ""}
              placeholder="Condition every 3-6 months. Keep away from prolonged water exposure."
              className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
            />
            {errors?.careInstructions && <p className="text-sm text-saddle-700">{errors.careInstructions[0]}</p>}
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-lg">Pricing</h2>
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-lg">SEO</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="metaTitle">
              Meta title (optional)
              <AiSuggestedTag show={aiFilledFields.has("metaTitle")} />
            </label>
            <Input id="metaTitle" name="metaTitle" ref={metaTitleRef} defaultValue={defaultValues?.metaTitle ?? ""} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="metaDescription">
              Meta description (optional)
              <AiSuggestedTag show={aiFilledFields.has("metaDescription")} />
            </label>
            <Input
              id="metaDescription"
              name="metaDescription"
              ref={metaDescriptionRef}
              defaultValue={defaultValues?.metaDescription ?? ""}
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-display text-lg">Publishing</h2>
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

        {state && !state.success && state.message && <p className="text-sm text-saddle-700">{state.message}</p>}
        <p className="text-xs text-ink/50">
          {pending ? "Saving…" : `Use "${submitLabel}" at the top of the page to save your changes.`}
        </p>
      </Card>

      {/* No submit button down here on purpose — the page's sticky header
          holds the one Save control (via `form={formId}`, an external
          submit button is a fully valid submit trigger for this form per
          the HTML spec, including implicit Enter-key submission from any
          text field above). A second button at the bottom just duplicated
          it at every scroll position. */}
    </form>
  );
}
