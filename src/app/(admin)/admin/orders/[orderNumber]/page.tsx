import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { OrderStatusBadge } from "@/components/retail/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { OrderTrackingForm } from "@/components/admin/order-tracking-form";
import { getOrderForAdmin } from "@/server/repositories/admin-orders";

export const metadata: Metadata = {
  title: "Order Detail",
  robots: { index: false },
};

type Props = { params: Promise<{ orderNumber: string }> };

type ShippingAddress = {
  name?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
};

export default async function AdminOrderDetailPage({ params }: Props) {
  await requireRole("ADMIN");
  const { orderNumber } = await params;
  const order = await getOrderForAdmin(orderNumber);

  if (!order) notFound();

  const shipping = order.shippingAddress as ShippingAddress | null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">
            {order.orderNumber} <Badge variant="muted">{order.channel}</Badge>
          </h1>
          <p className="text-sm text-ink/70">
            {order.user?.name ?? order.user?.email ?? order.guestEmail ?? "Guest"} ·{" "}
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <Card className="space-y-3 p-6">
        <h2 className="font-medium">Update Status</h2>
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </Card>

      <Card className="space-y-3 p-6">
        <h2 className="font-medium">Tracking</h2>
        <OrderTrackingForm
          orderId={order.id}
          currentCarrier={order.shippingCarrier}
          currentTrackingNumber={order.trackingNumber}
        />
        {order.trackingUrl && (
          <a href={order.trackingUrl} className="text-sm text-saddle hover:underline">
            View tracking →
          </a>
        )}
      </Card>

      <Card className="p-6">
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
            <span>Shipping</span>
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

      {shipping?.address && (
        <Card className="p-6">
          <h2 className="font-medium">Shipping Address</h2>
          <p className="mt-2 text-sm text-ink/70">
            {shipping.name}
            <br />
            {shipping.address.line1}
            {shipping.address.line2 ? <>, {shipping.address.line2}</> : null}
            <br />
            {shipping.address.city}, {shipping.address.state} {shipping.address.postal_code}
            <br />
            {shipping.address.country}
          </p>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="font-medium">Status History</h2>
        <div className="mt-4 space-y-3">
          {order.statusHistory.map((event) => (
            <div key={event.id} className="flex justify-between text-sm">
              <span>
                <OrderStatusBadge status={event.status} />
                {event.note && <span className="ml-2 text-ink/70">{event.note}</span>}
              </span>
              <span className="text-ink/70">
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
