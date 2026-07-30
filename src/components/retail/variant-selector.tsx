"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = {
  id: string;
  color: string | null;
  size: string | null;
  priceRetailOverride: number | null;
  stockQuantity: number;
};

export function VariantSelector({
  variants,
  basePrice,
}: {
  variants: Variant[];
  basePrice: number;
}) {
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter((c): c is string => !!c))),
    [variants],
  );
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter((s): s is string => !!s))),
    [variants],
  );

  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState(sizes[0]);

  const selected =
    variants.find(
      (v) => (colors.length === 0 || v.color === color) && (sizes.length === 0 || v.size === size),
    ) ?? variants[0];

  const price = selected?.priceRetailOverride ?? basePrice;
  const inStock = (selected?.stockQuantity ?? 0) > 0;

  return (
    <div className="space-y-6">
      <p className="font-display text-3xl">${price.toFixed(2)}</p>

      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-sm transition-colors",
                  c === color
                    ? "border-saddle bg-saddle-50"
                    : "border-cream-300 hover:border-saddle",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-sm transition-colors",
                  s === size
                    ? "border-saddle bg-saddle-50"
                    : "border-cream-300 hover:border-saddle",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Button disabled className="w-full sm:w-auto">
          {inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
        <p className="text-sm text-ink/60">
          Online ordering is launching soon — check back shortly.
        </p>
      </div>
    </div>
  );
}
