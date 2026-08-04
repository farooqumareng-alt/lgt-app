"use client";

import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createVariant } from "@/server/actions/admin-variants";

export function AddVariantForm({ productId }: { productId: string }) {
  const boundAction = createVariant.bind(null, productId);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: Awaited<ReturnType<typeof boundAction>> | undefined, formData: FormData) => {
    const result = await boundAction(prev, formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-2 gap-2 rounded-sm border border-dashed border-cream-300 p-3 sm:grid-cols-4">
      <div>
        <Input name="sku" placeholder="SKU" required />
        {errors?.sku && <p className="text-xs text-saddle-700">{errors.sku[0]}</p>}
      </div>
      <Input name="color" placeholder="Color" />
      <Input name="size" placeholder="Size" />
      <Input name="material" placeholder="Material" />
      <Input name="priceRetailOverride" type="number" step="0.01" placeholder="Retail override" />
      <Input name="priceWholesaleOverride" type="number" step="0.01" placeholder="Wholesale override" />
      <Input name="stockQuantity" type="number" min="0" defaultValue={0} placeholder="Stock" required />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked />
        Active
      </label>
      <div className="col-span-2 sm:col-span-4">
        <Button type="submit" variant="secondary" loading={pending}>
          {pending ? "Adding…" : "Add Variant"}
        </Button>
        {state && !state.success && state.message && (
          <p className="mt-1 text-sm text-saddle-700">{state.message}</p>
        )}
      </div>
    </form>
  );
}
