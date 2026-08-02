"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadProductImage } from "@/server/actions/admin-images";

export function ImageUploadForm({ productId }: { productId: string }) {
  const boundAction = uploadProductImage.bind(null, productId);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: Awaited<ReturnType<typeof boundAction>> | undefined, formData: FormData) => {
    const result = await boundAction(prev, formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, undefined);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="text-xs text-ink/60">Image file</label>
        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="block text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-ink/60">Alt text (required)</label>
        <Input name="altText" placeholder="Describe the image" required />
      </div>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Uploading…" : "Upload Image"}
      </Button>
      {state && !state.success && state.message && (
        <p className="w-full text-sm text-saddle-700">{state.message}</p>
      )}
    </form>
  );
}
