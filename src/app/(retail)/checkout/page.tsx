import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/retail/breadcrumbs";
import { Button } from "@/components/ui/button";
import { cartItemDto, getCart } from "@/server/repositories/cart";
import { createCheckoutSession } from "@/server/actions/checkout";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function CheckoutPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const cart = await getCart();
  const items = cart?.items.map(cartItemDto) ?? [];

  if (items.length === 0) {
    redirect("/cart");
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout", href: "/checkout" },
        ]}
      />
      <h1 className="mt-4 font-display text-3xl">Checkout</h1>

      {error && (
        <p className="mt-4 rounded-sm border border-saddle-700 bg-saddle-50 p-4 text-sm text-saddle-700">
          Something went wrong starting checkout. Please try again.
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
        <p className="text-xs text-ink/50">
          Shipping options and tax are calculated on the next step.
        </p>
      </div>

      <form action={createCheckoutSession} className="mt-6">
        <Button type="submit" className="w-full">
          Continue to Payment
        </Button>
      </form>
    </div>
  );
}
