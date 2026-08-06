import { AiTabs } from "@/components/admin/ai/ai-tabs";

type AiDashboardProps = {
  userId?: string;
  businessDataSummary: string;
  recentLogs: Array<{
    id: string;
    type: string;
    title: string;
    createdAt: string;
    user?: { email?: string | null; name?: string | null } | null;
  }>;
};

export function AiDashboard({ userId, businessDataSummary, recentLogs }: AiDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Admin AI Command Center</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/70">
          Five specialized agents for diagnostics, SEO, content, business intelligence, and security — all logged
          for review.
        </p>
      </div>
      <AiTabs userId={userId} businessDataSummary={businessDataSummary} recentLogs={recentLogs} />
    </div>
  );
}
