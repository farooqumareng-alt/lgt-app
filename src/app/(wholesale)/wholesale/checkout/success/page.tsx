import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ session_id?: string; order?: string }> };

export default async function WholesaleCheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId, order: orderNumber } = await searchParams;
  if (!sessionId && !orderNumber) redirect("/wholesale/shop");

  if (orderNumber) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order) redirect("/wholesale/shop");

    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-saddle">Order Placed</p>
        <h1 className="mt-2 font-display text-3xl">Thanks — your order is invoiced.</h1>
        <p className="mt-2 text-ink/70">Order {order.orderNumber}</p>
        <p className="mt-1 text-sm text-ink/60">
          We&apos;ve sent an invoice to your business email. Payment is due under your net-terms
          agreement.
        </p>

        <div className="mt-8 space-y-3 rounded-sm border border-cream-200 p-6 text-left">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.productNameSnapshot}
                {item.variantLabelSnapshot ? ` (${item.variantLabelSnapshot})` : ""} × {item.quantity}
              </span>
              <span className="font-medium">${Number(item.lineTotal).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-cream-200 pt-3 text-sm font-medium">
            <span>Total</span>
            <span>${Number(order.grandTotal).toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <ButtonLink href="/wholesale/shop">Continue Shopping</ButtonLink>
          <Link href="/wholesale/orders" className="flex items-center text-sm font-medium hover:text-saddle">
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  const session = await stripe.checkout.sessions
    .retrieve(sessionId!, { expand: ["line_items"] })
    .catch(() => null);

  if (!session || session.payment_status !== "paid") {
    redirect("/wholesale/shop");
  }

  const order = await prisma.order.findUnique({
    where: { stripeCheckoutSessionId: session.id },
  });

  const lineItems = session.line_items?.data ?? [];
  const total = (session.amount_total ?? 0) / 100;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-saddle">Order Confirmed</p>
      <h1 className="mt-2 font-display text-3xl">Thank you for your order!</h1>
      {order && <p className="mt-2 text-ink/70">Order {order.orderNumber}</p>}

      <div className="mt-8 space-y-3 rounded-sm border border-cream-200 p-6 text-left">
        {lineItems.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.description} × {item.quantity}
            </span>
            <span className="font-medium">${((item.amount_total ?? 0) / 100).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-cream-200 pt-3 text-sm font-medium">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <ButtonLink href="/wholesale/shop">Continue Shopping</ButtonLink>
        <Link href="/wholesale/orders" className="flex items-center text-sm font-medium hover:text-saddle">
          View Orders
        </Link>
      </div>
    </div>
  );
}
