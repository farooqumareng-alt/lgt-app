import type { Metadata } from "next";
import Link from "next/link";

import { requireApprovedWholesaler } from "@/lib/dal";
import { OrderStatusBadge } from "@/components/retail/order-status-badge";
import { Card } from "@/components/ui/card";
import { getOrdersForUser } from "@/server/repositories/orders";

export const metadata: Metadata = {
  title: "Wholesale Orders",
  robots: { index: false },
};

export default async function WholesaleOrdersPage() {
  const { session } = await requireApprovedWholesaler();
  const orders = await getOrdersForUser(session.user.id, "WHOLESALE");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-2xl">Wholesale Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-ink/60">
          No orders yet —{" "}
          <Link href="/wholesale/shop" className="text-saddle hover:underline">
            browse the wholesale shop
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/wholesale/orders/${order.orderNumber}`}>
              <Card interactive className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-ink/60">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    · {order.items.length} item{order.items.length === 1 ? "" : "s"} · $
                    {Number(order.grandTotal).toFixed(2)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
