import "server-only";

import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/server/repositories/admin-products";

// Orders in these statuses never collected (or kept) real revenue — excluded
// from every revenue figure on the dashboard so numbers reflect actual take,
// not gross order volume.
const NON_REVENUE_STATUSES = ["CANCELLED", "REFUNDED"] as const;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getAdminDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);

  const [ordersToday, revenueToday, pendingWholesaleCount, revenueByChannelThisMonth, activeProducts, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { createdAt: { gte: todayStart }, status: { notIn: [...NON_REVENUE_STATUSES] } },
      }),
      prisma.wholesaleAccount.count({ where: { approvalStatus: "PENDING" } }),
      prisma.order.groupBy({
        by: ["channel"],
        _sum: { grandTotal: true },
        where: { createdAt: { gte: monthStart }, status: { notIn: [...NON_REVENUE_STATUSES] } },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, variants: { select: { stockQuantity: true } } },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  const lowStockProducts = activeProducts
    .map((p) => ({ id: p.id, name: p.name, totalStock: p.variants.reduce((sum, v) => sum + v.stockQuantity, 0) }))
    .filter((p) => p.totalStock < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.totalStock - b.totalStock);

  const retailRevenueThisMonth = Number(
    revenueByChannelThisMonth.find((r) => r.channel === "RETAIL")?._sum.grandTotal ?? 0,
  );
  const wholesaleRevenueThisMonth = Number(
    revenueByChannelThisMonth.find((r) => r.channel === "WHOLESALE")?._sum.grandTotal ?? 0,
  );

  return {
    ordersToday,
    revenueToday: Number(revenueToday._sum.grandTotal ?? 0),
    pendingWholesaleCount,
    retailRevenueThisMonth,
    wholesaleRevenueThisMonth,
    lowStockProducts,
    recentOrders,
  };
}
