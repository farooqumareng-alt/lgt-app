import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { OrderStatusBadge } from "@/components/retail/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllOrdersForAdmin } from "@/server/repositories/admin-orders";
import type { OrderChannel, OrderStatus } from "@/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false },
};

const STATUSES: OrderStatus[] = ["INVOICED", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const CHANNELS: OrderChannel[] = ["RETAIL", "WHOLESALE"];

type Props = { searchParams: Promise<{ status?: string; channel?: string; q?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const { status, channel, q } = await searchParams;

  const orders = await getAllOrdersForAdmin({
    status: status && STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined,
    channel: channel && CHANNELS.includes(channel as OrderChannel) ? (channel as OrderChannel) : undefined,
    search: q?.trim() || undefined,
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-display text-3xl">Orders</h1>

      <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label className="text-xs text-ink/70">Search</label>
          <Input name="q" defaultValue={q ?? ""} placeholder="Order # or email" />
        </div>
        <div>
          <label className="text-xs text-ink/70">Status</label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="block rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink/70">Channel</label>
          <select
            name="channel"
            defaultValue={channel ?? ""}
            className="block rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink"
          >
            <option value="">All</option>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <div className="mt-8 space-y-3">
        {orders.length === 0 && <p className="text-ink/70">No orders match.</p>}
        {orders.map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.orderNumber}`}>
            <Card interactive stitched className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">
                  {order.orderNumber}
                  <Badge variant="muted" className="ml-2">
                    {order.channel}
                  </Badge>
                </p>
                <p className="text-xs text-ink/70">
                  {order.user?.name ?? order.user?.email ?? order.guestEmail ?? "Guest"} ·{" "}
                  {order.items.length} item{order.items.length === 1 ? "" : "s"} · $
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
