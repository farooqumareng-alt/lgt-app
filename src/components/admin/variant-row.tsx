"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toggleVariantActive, updateVariant, type VariantActionResult } from "@/server/actions/admin-variants";

type Variant = {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  material: string | null;
  priceRetailOverride: number | string | null;
  priceWholesaleOverride: number | string | null;
  stockQuantity: number;
  isActive: boolean;
};

function VariantEditForm({ variant, onDone }: { variant: Variant; onDone: () => void }) {
  const boundAction = updateVariant.bind(null, variant.id);
  const [state, formAction, pending] = useActionState<VariantActionResult | undefined, FormData>(
    async (prev, formData) => {
      const result = await boundAction(prev, formData);
      if (result.success) onDone();
      return result;
    },
    undefined,
  );
  const errors = state && !state.success ? state.errors : undefined;

  return (
    <form action={formAction} className="grid grid-cols-2 gap-2 rounded-sm border border-cream-200 p-3 sm:grid-cols-4">
      <div>
        <Input name="sku" defaultValue={variant.sku} placeholder="SKU" required />
        {errors?.sku && <p className="text-xs text-saddle-700">{errors.sku[0]}</p>}
      </div>
      <Input name="color" defaultValue={variant.color ?? ""} placeholder="Color" />
      <Input name="size" defaultValue={variant.size ?? ""} placeholder="Size" />
      <Input name="material" defaultValue={variant.material ?? ""} placeholder="Material" />
      <Input
        name="priceRetailOverride"
        type="number"
        step="0.01"
        defaultValue={variant.priceRetailOverride ?? ""}
        placeholder="Retail override"
      />
      <Input
        name="priceWholesaleOverride"
        type="number"
        step="0.01"
        defaultValue={variant.priceWholesaleOverride ?? ""}
        placeholder="Wholesale override"
      />
      <Input
        name="stockQuantity"
        type="number"
        min="0"
        defaultValue={variant.stockQuantity}
        placeholder="Stock"
        required
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={variant.isActive} />
        Active
      </label>
      <div className="col-span-2 flex gap-2 sm:col-span-4">
        <Button type="submit" loading={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <button type="button" onClick={onDone} className="text-sm text-ink/50 underline">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function VariantRow({ variant }: { variant: Variant }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (editing) {
    return (
      <VariantEditForm
        variant={variant}
        onDone={() => {
          setEditing(false);
          router.refresh();
        }}
      />
    );
  }

  const label = [variant.color, variant.size, variant.material].filter(Boolean).join(" / ") || "—";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-cream-200 p-3 text-sm">
      <div>
        <span className="font-medium">{variant.sku}</span>
        <span className="ml-2 text-ink/60">{label}</span>
        {!variant.isActive && (
          <Badge variant="muted" className="ml-2">
            Inactive
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-3 text-ink/70">
        <span>Stock: {variant.stockQuantity}</span>
        {variant.priceRetailOverride && <span>Retail: ${Number(variant.priceRetailOverride).toFixed(2)}</span>}
        {variant.priceWholesaleOverride && (
          <span>Wholesale: ${Number(variant.priceWholesaleOverride).toFixed(2)}</span>
        )}
        <button type="button" onClick={() => setEditing(true)} className="text-saddle hover:underline">
          Edit
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await toggleVariantActive(variant.id);
              router.refresh();
            })
          }
          className="text-saddle hover:underline"
        >
          {variant.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}
