"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { BlogPostActionResult } from "@/server/actions/admin-blog";

type BlogPostFormValues = {
  slug?: string;
  title?: string;
  excerpt?: string | null;
  body?: string;
  coverImageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isPublished?: boolean;
};

type BlogPostFormAction = (
  prevState: BlogPostActionResult | undefined,
  formData: FormData,
) => Promise<BlogPostActionResult>;

export function BlogPostForm({
  action,
  defaultValues,
  submitLabel = "Save Post",
}: {
  action: BlogPostFormAction;
  defaultValues?: BlogPostFormValues;
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
            Slug (becomes /blog/slug)
          </label>
          <Input id="slug" name="slug" defaultValue={defaultValues?.slug ?? ""} required />
          {errors?.slug && <p className="text-sm text-saddle-700">{errors.slug[0]}</p>}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="excerpt">
            Excerpt (optional — shown on the blog list)
          </label>
          <Input id="excerpt" name="excerpt" defaultValue={defaultValues?.excerpt ?? ""} maxLength={300} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="coverImageUrl">
            Cover image URL (optional)
          </label>
          <Input id="coverImageUrl" name="coverImageUrl" defaultValue={defaultValues?.coverImageUrl ?? ""} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="body">
            Body
          </label>
          <p className="text-xs text-ink/60">
            Plain text — leave a blank line between paragraphs. Start a paragraph with{" "}
            <code>## </code> for a section heading, or write every line starting with{" "}
            <code>- </code> for a bullet list.
          </p>
          <textarea
            id="body"
            name="body"
            rows={22}
            defaultValue={defaultValues?.body ?? ""}
            required
            className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
          />
          {errors?.body && <p className="text-sm text-saddle-700">{errors.body[0]}</p>}
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
        <input type="checkbox" name="isPublished" defaultChecked={defaultValues?.isPublished ?? false} />
        Published (visible on the live site)
      </label>

      {state && !state.success && state.message && <p className="text-sm text-saddle-700">{state.message}</p>}

      <SubmitButton pendingLabel="Saving…">{submitLabel}</SubmitButton>
    </form>
  );
}
