import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { OrderStatusBadge } from "@/components/retail/order-status-badge";
import { Card } from "@/components/ui/card";
import { getCustomerDetail, getCustomerOrders } from "@/server/repositories/admin-customers";

export const metadata: Metadata = {
  title: "Customer Detail",
  robots: { index: false },
};

type Props = { params: Promise<{ userId: string }> };

export default async function AdminCustomerDetailPage({ params }: Props) {
  await requireRole("ADMIN");
  const { userId } = await params;
  const customer = await getCustomerDetail(userId);
  if (!customer) notFound();

  const orders = await getCustomerOrders(userId);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-2xl">{customer.name ?? customer.email}</h1>
      <p className="mt-1 text-sm text-ink/60">
        {customer.email} · Joined{" "}
        {new Date(customer.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <h2 className="mt-8 font-medium">Order History</h2>
      <div className="mt-4 space-y-3">
        {orders.length === 0 && <p className="text-sm text-ink/60">No orders yet.</p>}
        {orders.map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.orderNumber}`}>
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
    </div>
  );
}
