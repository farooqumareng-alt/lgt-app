import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireApprovedWholesaler } from "@/lib/dal";
import { cartItemDtos, getOrCreateWholesaleCart } from "@/server/repositories/wholesale-cart";
import { Button } from "@/components/ui/button";
import { createWholesaleCheckoutSession, createWholesaleInvoiceOrder } from "@/server/actions/wholesale-checkout";

export const metadata: Metadata = {
  title: "Wholesale Checkout",
  robots: { index: false },
};

export default async function WholesaleCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { wholesaleAccount } = await requireApprovedWholesaler();
  const { error } = await searchParams;
  const cart = await getOrCreateWholesaleCart();
  const items = await cartItemDtos(cart);

  if (items.length === 0) {
    redirect("/wholesale/cart");
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl">Wholesale Checkout</h1>

      {error && (
        <p className="mt-4 rounded-sm border border-saddle-700 bg-saddle-50 p-4 text-sm text-saddle-700">
          Something went wrong placing your order. Please try again.
        </p>
      )}

      <div className="mt-8 space-y-4 rounded-sm border border-cream-200 p-6">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.name}
              {item.variantLabel ? ` (${item.variantLabel})` : ""} × {item.quantity}
            </span>
            <span className="font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-cream-200 pt-4 text-sm">
          <span className="text-ink/70">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-xs text-ink/50">Freight and tax are calculated on the next step.</p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <form action={createWholesaleCheckoutSession}>
          <Button type="submit" className="w-full">
            Pay by Card
          </Button>
        </form>
        {wholesaleAccount.netTermsDays && (
          <form action={createWholesaleInvoiceOrder}>
            <Button type="submit" variant="secondary" className="w-full">
              Place Order on Net {wholesaleAccount.netTermsDays} Terms
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
