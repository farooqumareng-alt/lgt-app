import type { Metadata } from "next";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/retail/order-status-badge";
import { Card } from "@/components/ui/card";
import { verifySession } from "@/lib/dal";
import { getRecentOrdersForUser } from "@/server/repositories/orders";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

export default async function AccountDashboardPage() {
  const session = await verifySession();
  const recentOrders = await getRecentOrdersForUser(session.user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Welcome back{session.user.name ? `, ${session.user.name}` : ""}</h1>
        <p className="mt-1 text-sm text-ink/60">{session.user.email}</p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-saddle hover:underline">
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-ink/60">
            No orders yet — <Link href="/shop" className="text-saddle hover:underline">start shopping</Link>.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.orderNumber}`}>
                <Card interactive className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-ink/60">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"} · $
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/account/addresses">
          <Card interactive className="p-5">
            <p className="font-medium">Addresses</p>
            <p className="text-sm text-ink/60">Manage your saved addresses</p>
          </Card>
        </Link>
        <Link href="/account/settings">
          <Card interactive className="p-5">
            <p className="font-medium">Settings</p>
            <p className="text-sm text-ink/60">Update your name, email, and password</p>
          </Card>
        </Link>
        {session.user.role === "ADMIN" && (
          <Link href="/admin">
            <Card interactive className="p-5 sm:col-span-2">
              <p className="font-medium">Admin Dashboard</p>
              <p className="text-sm text-ink/60">Orders, products, customers, and pending approvals</p>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
