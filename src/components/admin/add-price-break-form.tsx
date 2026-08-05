"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPriceBreak } from "@/server/actions/admin-price-breaks";

export function AddPriceBreakForm({ productId }: { productId: string }) {
  const boundAction = createPriceBreak.bind(null, productId);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: Awaited<ReturnType<typeof boundAction>> | undefined, formData: FormData) => {
    const result = await boundAction(prev, formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="text-xs text-ink/70">Min quantity</label>
        <Input name="minQuantity" type="number" min="2" placeholder="10" required />
        {errors?.minQuantity && <p className="text-xs text-saddle-700">{errors.minQuantity[0]}</p>}
      </div>
      <div>
        <label className="text-xs text-ink/70">Price per unit ($)</label>
        <Input name="price" type="number" step="0.01" min="0" placeholder="15.00" required />
        {errors?.price && <p className="text-xs text-saddle-700">{errors.price[0]}</p>}
      </div>
      <Button type="submit" variant="secondary" loading={pending}>
        {pending ? "Adding…" : "Add Price Break"}
      </Button>
      {state && !state.success && state.message && (
        <p className="w-full text-sm text-saddle-700">{state.message}</p>
      )}
    </form>
  );
}
