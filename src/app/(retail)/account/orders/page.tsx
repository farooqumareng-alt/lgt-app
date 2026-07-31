import type { Metadata } from "next";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/retail/order-status-badge";
import { Card } from "@/components/ui/card";
import { verifySession } from "@/lib/dal";
import { getOrdersForUser } from "@/server/repositories/orders";

export const metadata: Metadata = {
  title: "Order History",
  robots: { index: false },
};

export default async function OrdersPage() {
  const session = await verifySession();
  const orders = await getOrdersForUser(session.user.id);

  return (
    <div>
      <h1 className="font-display text-2xl">Order History</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-ink/60">
          No orders yet — <Link href="/shop" className="text-saddle hover:underline">start shopping</Link>.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.orderNumber}`}>
              <Card className="flex items-center justify-between p-4 hover:border-saddle">
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
