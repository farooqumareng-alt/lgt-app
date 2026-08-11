"use client";

import { useState, useTransition } from "react";

import { LowStockChart } from "@/components/admin/charts/low-stock-chart";
import { RevenueByChannelChart } from "@/components/admin/charts/revenue-by-channel-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateAdminBusinessReport, generateAdminAnalyticsSummary } from "@/server/actions/admin-ai";
import type { AiBusinessReportResult, AiAnalyticsSummaryResult } from "@/lib/admin-ai";

export type ChartStats = {
  revenueByChannel: { retail: number; wholesale: number };
  lowStockProducts: { name: string; totalStock: number }[];
};

function ResultBlock({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 space-y-3 rounded-sm bg-cream-50 p-4 text-sm text-ink/80">{children}</div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold text-ink">{label}</p>
      <p className="whitespace-pre-wrap">{value}</p>
    </div>
  );
}

export function BusinessAgentPanel({
  userId,
  businessDataSummary,
  chartStats,
}: {
  userId?: string;
  businessDataSummary: string;
  chartStats: ChartStats;
}) {
  const [focus, setFocus] = useState("");
  const [reportResult, setReportResult] = useState<AiBusinessReportResult | null>(null);
  const [reportPending, startReport] = useTransition();
  const [reportError, setReportError] = useState<string | null>(null);

  const [analyticsResult, setAnalyticsResult] = useState<AiAnalyticsSummaryResult | null>(null);
  const [analyticsPending, startAnalytics] = useTransition();
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  function runReport() {
    setReportError(null);
    if (!focus.trim()) return setReportError("Describe what to focus the report on first.");
    startReport(async () => {
      const result = await generateAdminBusinessReport({
        userId,
        focus,
        dataSummary: businessDataSummary,
        timeframe: "current",
      });
      if (!result.success) return setReportError(result.message);
      setReportResult(result.result);
    });
  }

  function runAnalytics() {
    setAnalyticsError(null);
    startAnalytics(async () => {
      const result = await generateAdminAnalyticsSummary({ userId, dataSummary: businessDataSummary });
      if (!result.success) return setAnalyticsError(result.message);
      setAnalyticsResult(result.result);
    });
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <Card className="space-y-3 p-6">
        <h2 className="text-lg font-medium">Analytics</h2>
        <p className="text-sm text-ink/70">
          Your actual current numbers, charted directly from the database — the AI never generates these figures,
          only comments on what they mean.
        </p>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink/70">Revenue by channel — this month</p>
          <RevenueByChannelChart
            retail={chartStats.revenueByChannel.retail}
            wholesale={chartStats.revenueByChannel.wholesale}
          />
        </div>

        {chartStats.lowStockProducts.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/70">Low stock</p>
            <LowStockChart items={chartStats.lowStockProducts} />
          </div>
        )}

        <details className="rounded-sm border border-cream-200 p-3 text-xs text-ink/70">
          <summary className="cursor-pointer font-medium text-ink">View the full data snapshot sent to the AI</summary>
          <pre className="mt-2 whitespace-pre-wrap">{businessDataSummary}</pre>
        </details>
        <Button type="button" variant="secondary" loading={analyticsPending} onClick={runAnalytics}>
          {analyticsPending ? "Analyzing…" : "Get AI Commentary"}
        </Button>
        {analyticsError && <p className="text-sm text-saddle-700">{analyticsError}</p>}
        {analyticsResult && (
          <ResultBlock>
            <Field label="Insights" value={analyticsResult.insights} />
            <Field label="Trends" value={analyticsResult.trends} />
            <Field label="Recommendations" value={analyticsResult.recommendations} />
          </ResultBlock>
        )}
      </Card>

      <Card className="space-y-3 p-6">
        <h2 className="text-lg font-medium">Reports</h2>
        <p className="text-sm text-ink/70">A focused report combining the live data snapshot with a specific question or area.</p>
        <Input placeholder="What should this report focus on? (e.g. wholesale growth risk)" value={focus} onChange={(e) => setFocus(e.target.value)} />
        <Button type="button" variant="secondary" loading={reportPending} onClick={runReport}>
          {reportPending ? "Generating…" : "Generate Report"}
        </Button>
        {reportError && <p className="text-sm text-saddle-700">{reportError}</p>}
        {reportResult && (
          <ResultBlock>
            <Field label="Summary" value={reportResult.summary} />
            <Field label="Opportunities" value={reportResult.opportunities} />
            <Field label="Risks" value={reportResult.risks} />
            <Field label="Recommendations" value={reportResult.recommendations} />
          </ResultBlock>
        )}
      </Card>
    </div>
  );
}
