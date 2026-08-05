import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/retail/breadcrumbs";
import { CartItemRow } from "@/components/retail/cart-item-row";
import { ButtonLink } from "@/components/ui/button";
import { cartItemDto, getCart } from "@/server/repositories/cart";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false },
};

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items.map(cartItemDto) ?? [];
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }]} />
      <h1 className="mt-4 font-display text-3xl">Your Cart</h1>

      {items.length === 0 ? (
        <div className="mt-12 space-y-4 text-center">
          <p className="text-ink/70">Your cart is empty.</p>
          <ButtonLink href="/shop">Shop the Collection</ButtonLink>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {items.map((item) => (
              <CartItemRow key={item.id} {...item} />
            ))}
          </div>

          <div className="h-fit space-y-4 rounded-sm border border-cream-200 p-6">
            <div className="flex justify-between text-sm">
              <span className="text-ink/70">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-ink/70">Shipping and tax calculated at checkout.</p>
            <ButtonLink href="/checkout" className="w-full text-center">
              Checkout
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
