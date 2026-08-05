import type { Metadata } from "next";

import { requireApprovedWholesaler } from "@/lib/dal";
import { cartItemDtos, getOrCreateWholesaleCart } from "@/server/repositories/wholesale-cart";
import { WholesaleCartItemRow } from "@/components/wholesale/wholesale-cart-item-row";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Wholesale Cart",
  robots: { index: false },
};

export default async function WholesaleCartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; min?: string }>;
}) {
  const { wholesaleAccount } = await requireApprovedWholesaler();
  const { error, min } = await searchParams;
  const cart = await getOrCreateWholesaleCart();
  const items = await cartItemDtos(cart);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const minimumOrderValue = wholesaleAccount.minimumOrderValue
    ? Number(wholesaleAccount.minimumOrderValue)
    : null;
  const belowMinimum = minimumOrderValue !== null && subtotal < minimumOrderValue;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl">Wholesale Cart</h1>

      {error === "stock" && (
        <p className="mt-4 rounded-sm border border-saddle-700 bg-saddle-50 p-4 text-sm text-saddle-700">
          One or more items changed availability — please review your cart.
        </p>
      )}
      {error === "minimum" && (
        <p className="mt-4 rounded-sm border border-saddle-700 bg-saddle-50 p-4 text-sm text-saddle-700">
          Your order must be at least ${Number(min).toFixed(2)} to check out.
        </p>
      )}

      {items.length === 0 ? (
        <div className="mt-12 space-y-4 text-center">
          <p className="text-ink/70">Your wholesale cart is empty.</p>
          <ButtonLink href="/wholesale/shop">Browse Wholesale Shop</ButtonLink>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {items.map((item) => (
              <WholesaleCartItemRow key={item.id} {...item} />
            ))}
          </div>

          <div className="h-fit space-y-4 rounded-sm border border-cream-200 p-6">
            <div className="flex justify-between text-sm">
              <span className="text-ink/70">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-ink/70">Freight and tax calculated at checkout.</p>
            {minimumOrderValue !== null && (
              <p className="text-xs text-ink/70">Minimum order: ${minimumOrderValue.toFixed(2)}</p>
            )}
            {belowMinimum ? (
              <p className="text-sm text-saddle-700">
                Add ${(minimumOrderValue! - subtotal).toFixed(2)} more to reach the order minimum.
              </p>
            ) : (
              <ButtonLink href="/wholesale/checkout" className="w-full text-center">
                Checkout
              </ButtonLink>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
