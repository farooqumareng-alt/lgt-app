import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireApprovedWholesaler } from "@/lib/dal";
import { OrderStatusBadge } from "@/components/retail/order-status-badge";
import { Card } from "@/components/ui/card";
import { getOrderDetail } from "@/server/repositories/orders";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Order Detail",
  robots: { index: false },
};

type Props = { params: Promise<{ orderNumber: string }> };

export default async function WholesaleOrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const { session } = await requireApprovedWholesaler();
  const order = await getOrderDetail(session.user.id, orderNumber);

  if (!order || order.channel !== "WHOLESALE") notFound();

  let hostedInvoiceUrl: string | null = null;
  if (order.paymentMethod === "INVOICE" && order.stripeInvoiceId) {
    const invoice = await stripe.invoices.retrieve(order.stripeInvoiceId).catch(() => null);
    hostedInvoiceUrl = invoice?.hosted_invoice_url ?? null;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">{order.orderNumber}</h1>
          <p className="text-sm text-ink/60">
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {hostedInvoiceUrl && (
        <Card className="mt-6 p-4">
          <a href={hostedInvoiceUrl} className="text-sm text-saddle hover:underline">
            View / pay this invoice on Stripe →
          </a>
        </Card>
      )}

      <Card className="mt-6 p-6">
        <h2 className="font-medium">Items</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.productNameSnapshot}
                {item.variantLabelSnapshot ? ` (${item.variantLabelSnapshot})` : ""} × {item.quantity}
              </span>
              <span className="font-medium">${Number(item.lineTotal).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-cream-200 pt-4 text-sm">
          <div className="flex justify-between text-ink/70">
            <span>Subtotal</span>
            <span>${Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-ink/70">
            <span>Freight</span>
            <span>${Number(order.shippingTotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-ink/70">
            <span>Tax</span>
            <span>${Number(order.taxTotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${Number(order.grandTotal).toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="font-medium">Status History</h2>
        <div className="mt-4 space-y-3">
          {order.statusHistory.map((event) => (
            <div key={event.id} className="flex justify-between text-sm">
              <span>
                <OrderStatusBadge status={event.status} />
                {event.note && <span className="ml-2 text-ink/60">{event.note}</span>}
              </span>
              <span className="text-ink/50">
                {new Date(event.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
