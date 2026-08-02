"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deletePriceBreak } from "@/server/actions/admin-price-breaks";

type PriceBreak = { id: string; minQuantity: number; price: number | string };

export function PriceBreakRow({ priceBreak }: { priceBreak: PriceBreak }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center justify-between rounded-sm border border-cream-200 p-3 text-sm">
      <span>
        {priceBreak.minQuantity}+ units → ${Number(priceBreak.price).toFixed(2)} each
      </span>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await deletePriceBreak(priceBreak.id);
            router.refresh();
          })
        }
        className="text-ink/50 hover:text-saddle-700"
      >
        Remove
      </button>
    </div>
  );
}
