"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { CategoryActionResult } from "@/server/actions/admin-categories";

type CategoryFormValues = {
  name?: string;
  urlSlug?: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  sortOrder?: number;
};

type CategoryFormAction = (
  prevState: CategoryActionResult | undefined,
  formData: FormData,
) => Promise<CategoryActionResult>;

export function CategoryForm({
  action,
  defaultValues,
  submitLabel = "Save Category",
}: {
  action: CategoryFormAction;
  defaultValues?: CategoryFormValues;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <Input id="name" name="name" defaultValue={defaultValues?.name ?? ""} required />
          {errors?.name && <p className="text-sm text-saddle-700">{errors.name[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="urlSlug">
            URL slug
          </label>
          <Input
            id="urlSlug"
            name="urlSlug"
            placeholder="laptop-bags"
            defaultValue={defaultValues?.urlSlug ?? ""}
            required
          />
          <p className="text-xs text-ink/60">
            Just the last part — lowercase letters, numbers, and hyphens only, e.g. <code>laptop-bags</code>, not the
            full path. The page will be at /shop/{"{this value}"}.
          </p>
          {errors?.urlSlug && <p className="text-sm text-saddle-700">{errors.urlSlug[0]}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="description">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={defaultValues?.description ?? ""}
            className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
          />
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
          <Input id="metaDescription" name="metaDescription" defaultValue={defaultValues?.metaDescription ?? ""} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="sortOrder">
            Sort order
          </label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={defaultValues?.sortOrder ?? 0}
          />
          <p className="text-xs text-ink/60">Lower numbers appear first in category lists.</p>
        </div>
      </div>

      {state && !state.success && state.message && <p className="text-sm text-saddle-700">{state.message}</p>}

      <SubmitButton pendingLabel="Saving…">{submitLabel}</SubmitButton>
    </form>
  );
}
