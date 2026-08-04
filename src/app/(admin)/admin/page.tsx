import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { OrderStatusBadge } from "@/components/retail/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAdminDashboardStats } from "@/server/repositories/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false },
};

function StatTile({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: string;
  href?: string;
  tone?: "warn";
}) {
  const content = (
    <Card interactive={!!href} className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
      <p className={`mt-2 font-display text-3xl ${tone === "warn" ? "text-saddle-700" : "text-ink"}`}>{value}</p>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");
  const stats = await getAdminDashboardStats();

  const monthRevenue = stats.retailRevenueThisMonth + stats.wholesaleRevenueThisMonth;
  const wholesalePct = monthRevenue > 0 ? Math.round((stats.wholesaleRevenueThisMonth / monthRevenue) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl">Dashboard</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Orders Today" value={String(stats.ordersToday)} href="/admin/orders" />
        <StatTile label="Revenue Today" value={`$${stats.revenueToday.toFixed(2)}`} href="/admin/orders" />
        <StatTile
          label="Pending Wholesale"
          value={String(stats.pendingWholesaleCount)}
          href="/admin/wholesale-applications"
          tone={stats.pendingWholesaleCount > 0 ? "warn" : undefined}
        />
        <StatTile
          label="Low Stock Items"
          value={String(stats.lowStockProducts.length)}
          href="/admin/products"
          tone={stats.lowStockProducts.length > 0 ? "warn" : undefined}
        />
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-[1.3fr_1fr]">
        <section>
          <h2 className="font-display text-xl">Recent Orders</h2>
          <div className="mt-4 space-y-3">
            {stats.recentOrders.length === 0 && <p className="text-sm text-ink/60">No orders yet.</p>}
            {stats.recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.orderNumber}`}>
                <Card interactive className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">
                      {order.orderNumber}
                      <Badge variant="muted" className="ml-2">
                        {order.channel}
                      </Badge>
                    </p>
                    <p className="text-xs text-ink/60">
                      {order.user?.name ?? order.user?.email ?? order.guestEmail ?? "Guest"} · $
                      {Number(order.grandTotal).toFixed(2)}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl">This Month</h2>
          <Card className="mt-4 p-5">
            <div className="flex justify-between text-sm">
              <span className="text-ink/70">Retail</span>
              <span className="font-medium">${stats.retailRevenueThisMonth.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-ink/70">Wholesale</span>
              <span className="font-medium">${stats.wholesaleRevenueThisMonth.toFixed(2)}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-200">
              <div className="h-full bg-saddle" style={{ width: `${wholesalePct}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink/50">{wholesalePct}% of this month&apos;s revenue is wholesale</p>
            <div className="mt-4 flex justify-between border-t border-cream-200 pt-3 text-sm font-medium">
              <span>Total</span>
              <span>${monthRevenue.toFixed(2)}</span>
            </div>
          </Card>

          <h2 className="mt-8 font-display text-xl">Low Stock</h2>
          <Card className="mt-4 p-5">
            {stats.lowStockProducts.length === 0 && <p className="text-sm text-ink/60">Everything is well stocked.</p>}
            {stats.lowStockProducts.length > 0 && (
              <ul className="space-y-2">
                {stats.lowStockProducts.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span className="truncate text-ink/80">{p.name}</span>
                    <span className="shrink-0 font-medium text-saddle-700">{p.totalStock} left</span>
                  </li>
                ))}
              </ul>
            )}
            {stats.lowStockProducts.length > 0 && (
              <Link href="/admin/products" className="mt-3 inline-block text-xs font-medium text-saddle hover:underline">
                View all products →
              </Link>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
