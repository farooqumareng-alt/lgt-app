"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";

import { ProductImagePlaceholder } from "@/components/retail/product-image-placeholder";
import { PriceBreakTable } from "@/components/wholesale/price-break-table";
import { Button } from "@/components/ui/button";
import { bulkAddToWholesaleCart } from "@/server/actions/wholesale-cart";

type WholesaleProduct = {
  id: string;
  slug: string;
  name: string;
  basePriceWholesale: number;
  image: { url: string; altText: string } | null;
  priceBreaks: { minQuantity: number; price: number }[];
  variants: {
    id: string;
    sku: string;
    color: string | null;
    size: string | null;
    stockQuantity: number;
    unitPrice: number;
  }[];
};

export function BulkOrderGrid({ products }: { products: WholesaleProduct[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const rows: { sku: string; quantity: number }[] = [];
    for (const product of products) {
      for (const variant of product.variants) {
        const raw = formData.get(`qty_${variant.sku}`);
        const quantity = raw ? Number(raw) : 0;
        if (quantity > 0) rows.push({ sku: variant.sku, quantity });
      }
    }

    if (rows.length === 0) {
      setMessage("Enter a quantity for at least one item.");
      return;
    }

    startTransition(async () => {
      const result = await bulkAddToWholesaleCart(rows);
      if (result.success) {
        setMessage(`Added ${result.addedCount} item${result.addedCount === 1 ? "" : "s"} to your cart.`);
        formRef.current?.reset();
      } else {
        setMessage(result.error);
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex gap-4 border-b border-cream-200 pb-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm">
              {product.image ? (
                <Image src={product.image.url} alt={product.image.altText} fill className="object-cover" sizes="80px" />
              ) : (
                <ProductImagePlaceholder />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{product.name}</p>
              <PriceBreakTable basePrice={product.basePriceWholesale} priceBreaks={product.priceBreaks} />
              <div className="mt-3 space-y-2">
                {product.variants.map((variant) => {
                  const label = [variant.color, variant.size].filter(Boolean).join(" / ") || variant.sku;
                  return (
                    <div key={variant.id} className="flex items-center gap-3 text-sm">
                      <span className="w-40 truncate text-ink/70">{label}</span>
                      <span className="w-16 text-ink/50">${variant.unitPrice.toFixed(2)}</span>
                      <input
                        type="number"
                        name={`qty_${variant.sku}`}
                        min={0}
                        max={variant.stockQuantity}
                        defaultValue={0}
                        disabled={variant.stockQuantity === 0}
                        className="w-20 rounded-sm border border-cream-300 bg-cream-50 px-2 py-1 disabled:opacity-40"
                      />
                      <span className="text-xs text-ink/40">
                        {variant.stockQuantity === 0 ? "Out of stock" : `${variant.stockQuantity} in stock`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {message && <p className="text-sm text-saddle-700">{message}</p>}

      <Button type="submit" loading={isPending}>
        {isPending ? "Adding…" : "Add All to Cart"}
      </Button>
    </form>
  );
}
