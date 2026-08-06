import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/dal";
import { AiDashboard } from "@/components/admin/ai-dashboard";
import { getAdminDashboardStats } from "@/server/repositories/admin-dashboard";
import { getRecentAiActivityLogs } from "@/server/repositories/admin-ai-logs";

export const metadata: Metadata = {
  title: "Admin AI Assistant",
  robots: { index: false },
};

function buildBusinessDataSummary(stats: Awaited<ReturnType<typeof getAdminDashboardStats>>): string {
  const monthRevenue = stats.retailRevenueThisMonth + stats.wholesaleRevenueThisMonth;
  const lowStockList = stats.lowStockProducts
    .slice(0, 8)
    .map((p) => `${p.name} (${p.totalStock} left)`)
    .join(", ");

  return [
    `Orders today: ${stats.ordersToday}, revenue today: $${stats.revenueToday.toFixed(2)}.`,
    `This month's revenue: $${monthRevenue.toFixed(2)} total — $${stats.retailRevenueThisMonth.toFixed(2)} retail, $${stats.wholesaleRevenueThisMonth.toFixed(2)} wholesale.`,
    `Pending wholesale applications awaiting review: ${stats.pendingWholesaleCount}.`,
    `New custom requests awaiting review: ${stats.newCustomRequestsCount}.`,
    `Low stock items (below threshold): ${stats.lowStockProducts.length}${lowStockList ? ` — ${lowStockList}` : ""}.`,
    `Recent orders: ${stats.recentOrders
      .slice(0, 5)
      .map((o) => `${o.orderNumber} (${o.channel}, $${Number(o.grandTotal).toFixed(2)}, ${o.status})`)
      .join("; ")}.`,
  ].join(" ");
}

export default async function AdminAiPage() {
  await requireRole("ADMIN");
  const session = await auth();

  let recentLogs: Awaited<ReturnType<typeof getRecentAiActivityLogs>> = [];
  try {
    recentLogs = await getRecentAiActivityLogs(20);
  } catch (error) {
    console.error("Unable to load AI activity logs for admin AI page:", error);
    recentLogs = [];
  }

  const stats = await getAdminDashboardStats();
  const businessDataSummary = buildBusinessDataSummary(stats);

  const serializedLogs = recentLogs.map((log) => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <AiDashboard
        userId={session?.user?.id ?? undefined}
        businessDataSummary={businessDataSummary}
        recentLogs={serializedLogs}
      />
    </main>
  );
}
