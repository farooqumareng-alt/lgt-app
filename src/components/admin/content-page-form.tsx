"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ContentPageActionResult } from "@/server/actions/admin-content";

type ContentPageFormValues = {
  slug?: string;
  title?: string;
  content?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  showInFooter?: boolean;
};

type ContentPageFormAction = (
  prevState: ContentPageActionResult | undefined,
  formData: FormData,
) => Promise<ContentPageActionResult>;

export function ContentPageForm({
  action,
  defaultValues,
  submitLabel = "Save Page",
}: {
  action: ContentPageFormAction;
  defaultValues?: ContentPageFormValues;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="title">
            Title
          </label>
          <Input id="title" name="title" defaultValue={defaultValues?.title ?? ""} required />
          {errors?.title && <p className="text-sm text-saddle-700">{errors.title[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="slug">
            Slug (becomes /slug)
          </label>
          <Input id="slug" name="slug" defaultValue={defaultValues?.slug ?? ""} required />
          {errors?.slug && <p className="text-sm text-saddle-700">{errors.slug[0]}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="content">
            Content
          </label>
          <p className="text-xs text-ink/60">Plain text — leave a blank line between paragraphs.</p>
          <textarea
            id="content"
            name="content"
            rows={14}
            defaultValue={defaultValues?.content ?? ""}
            required
            className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
          />
          {errors?.content && <p className="text-sm text-saddle-700">{errors.content[0]}</p>}
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
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="showInFooter" defaultChecked={defaultValues?.showInFooter ?? true} />
        Show in footer navigation
      </label>

      {state && !state.success && state.message && <p className="text-sm text-saddle-700">{state.message}</p>}

      <SubmitButton pendingLabel="Saving…">{submitLabel}</SubmitButton>
    </form>
  );
}
