"use client";

import { useRouter } from "next/navigation";

import { DeleteWithConfirmButton } from "@/components/admin/delete-with-confirm-button";
import { deletePriceBreak } from "@/server/actions/admin-price-breaks";

type PriceBreak = { id: string; minQuantity: number; price: number | string };

export function PriceBreakRow({ priceBreak }: { priceBreak: PriceBreak }) {
  const router = useRouter();

  return (
    <tr className="border-b border-cream-200 last:border-0">
      <td className="py-2 pr-4 text-sm">{priceBreak.minQuantity}+ units</td>
      <td className="py-2 pr-4 text-sm">${Number(priceBreak.price).toFixed(2)} each</td>
      <td className="py-2 text-right">
        <DeleteWithConfirmButton
          label="Remove"
          pendingLabel="Removing…"
          confirmMessage={`Remove the ${priceBreak.minQuantity}+ unit price break? This can't be undone.`}
          action={async () => {
            await deletePriceBreak(priceBreak.id);
            router.refresh();
          }}
        />
      </td>
    </tr>
  );
}
