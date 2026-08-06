import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/dal";
import { AiDashboard } from "@/components/admin/ai-dashboard";
import { getRecentAiActivityLogs } from "@/server/repositories/admin-ai-logs";

export const metadata: Metadata = {
  title: "Admin AI Assistant",
  robots: { index: false },
};

export default async function AdminAiPage() {
  await requireRole("ADMIN");
  const session = await auth();
  let recentLogs: Awaited<ReturnType<typeof getRecentAiActivityLogs>> = [];

  try {
    recentLogs = await getRecentAiActivityLogs(12);
  } catch (error) {
    console.error("Unable to load AI activity logs for admin AI page:", error);
    recentLogs = [];
  }

  const serializedLogs = recentLogs.map((log) => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <AiDashboard userId={session?.user?.id ?? undefined} recentLogs={serializedLogs} />
    </main>
  );
}
