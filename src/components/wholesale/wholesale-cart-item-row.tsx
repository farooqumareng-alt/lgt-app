"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";

import { ProductImagePlaceholder } from "@/components/retail/product-image-placeholder";
import { removeWholesaleCartItem, updateWholesaleCartItemQuantity } from "@/server/actions/wholesale-cart";

type WholesaleCartItemRowProps = {
  id: string;
  name: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  stockQuantity: number;
  image: { url: string; altText: string } | null;
};

export function WholesaleCartItemRow({
  id,
  name,
  variantLabel,
  unitPrice,
  quantity,
  stockQuantity,
  image,
}: WholesaleCartItemRowProps) {
  const [isPending, startTransition] = useTransition();

  function changeQuantity(next: number) {
    startTransition(() => {
      updateWholesaleCartItemQuantity(id, next);
    });
  }

  function remove() {
    startTransition(() => {
      removeWholesaleCartItem(id);
    });
  }

  return (
    <div className="flex gap-4 border-b border-cream-200 py-6 last:border-b-0">
      <Link href={`/wholesale/shop`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm">
        {image ? (
          <Image src={image.url} alt={image.altText} fill className="object-cover" sizes="96px" />
        ) : (
          <ProductImagePlaceholder />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href="/wholesale/shop" className="font-medium hover:text-saddle">
            {name}
          </Link>
          {variantLabel && <p className="text-sm text-ink/60">{variantLabel}</p>}
          <p className="mt-1 text-sm text-ink/70">${unitPrice.toFixed(2)} / unit</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-sm border border-cream-300">
            <button
              type="button"
              disabled={isPending}
              onClick={() => changeQuantity(quantity - 1)}
              className="px-3 py-1 text-sm hover:text-saddle disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-[2ch] px-1 text-center text-sm">{quantity}</span>
            <button
              type="button"
              disabled={isPending || quantity >= stockQuantity}
              onClick={() => changeQuantity(quantity + 1)}
              className="px-3 py-1 text-sm hover:text-saddle disabled:opacity-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={remove}
            className="text-sm text-ink/50 underline hover:text-saddle-700"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="font-medium">${(unitPrice * quantity).toFixed(2)}</p>
    </div>
  );
}
