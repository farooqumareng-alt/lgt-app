"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductActionResult } from "@/server/actions/admin-products";

type Category = { id: string; name: string };

type ProductFormValues = {
  name?: string;
  slug?: string;
  sku?: string;
  categoryId?: string;
  shortDescription?: string | null;
  description?: string;
  materials?: string[];
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
}: {
  action: ProductFormAction;
  categories: Category[];
  defaultValues?: ProductFormValues;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <Input id="name" name="name" defaultValue={defaultValues?.name ?? ""} required />
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
          <label className="text-sm font-medium" htmlFor="shortDescription">
            Short description (optional)
          </label>
          <Input
            id="shortDescription"
            name="shortDescription"
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
            id="materials"
            name="materials"
            defaultValue={defaultValues?.materials?.join(", ") ?? ""}
            placeholder="Full-grain leather, brass hardware"
          />
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
          <Input id="metaTitle" name="metaTitle" defaultValue={defaultValues?.metaTitle ?? ""} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="metaDescription">
            Meta description (optional)
          </label>
          <Input
            id="metaDescription"
            name="metaDescription"
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
            defaultChecked={defaultValues?.isCustomizable ?? false}
          />
          Customizable
        </label>
      </div>

      {state && !state.success && state.message && (
        <p className="text-sm text-saddle-700">{state.message}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
