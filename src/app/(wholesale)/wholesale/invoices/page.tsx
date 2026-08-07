import type { Metadata } from "next";
import Link from "next/link";

import { requireApprovedWholesaler } from "@/lib/dal";
import { OrderStatusBadge } from "@/components/retail/order-status-badge";
import { Card } from "@/components/ui/card";
import { getInvoicedOrdersForUser } from "@/server/repositories/orders";

export const metadata: Metadata = {
  title: "Invoices",
  robots: { index: false },
};

export default async function WholesaleInvoicesPage() {
  const { session } = await requireApprovedWholesaler();
  const orders = await getInvoicedOrdersForUser(session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-2xl">Invoices</h1>
      <p className="mt-1 text-sm text-ink/70">Orders placed under net terms. Open an order to view or pay its invoice.</p>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-ink/70">
          No invoiced orders yet —{" "}
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
                  <p className="text-xs text-ink/70">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    · ${Number(order.grandTotal).toFixed(2)}
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
