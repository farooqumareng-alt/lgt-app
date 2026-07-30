"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { addToCart } from "@/server/actions/cart";
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

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  function handleAddToCart() {
    if (!selected) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await addToCart(selected.id, 1);
      setFeedback(
        result.success
          ? { type: "success", message: "Added to cart." }
          : { type: "error", message: result.error },
      );
    });
  }

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
        <Button
          type="button"
          disabled={!inStock || isPending}
          onClick={handleAddToCart}
          className="w-full sm:w-auto"
        >
          {!inStock ? "Out of Stock" : isPending ? "Adding…" : "Add to Cart"}
        </Button>
        {feedback && (
          <p className={cn("text-sm", feedback.type === "error" ? "text-saddle-700" : "text-ink/70")}>
            {feedback.message}{" "}
            {feedback.type === "success" && (
              <Link href="/cart" className="underline">
                View cart
              </Link>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
