"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateAdminSecuritySummary } from "@/server/actions/admin-ai";
import type { AiSecuritySummaryResult } from "@/lib/admin-ai";

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

type LogEntry = {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  user?: { email?: string | null; name?: string | null } | null;
};

export function SecurityAgentPanel({ userId, recentLogs }: { userId?: string; recentLogs: LogEntry[] }) {
  const [area, setArea] = useState("admin access and role permissions");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<AiSecuritySummaryResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function runSummary() {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await generateAdminSecuritySummary({ userId, area, note });
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }
      setResult(res.result);
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Card className="space-y-3 p-6">
          <h2 className="text-lg font-medium">Permissions Review</h2>
          <p className="text-sm text-ink/70">Findings, risk level, and remediation guidance for an area of admin access.</p>
          <Input placeholder="Area to review" value={area} onChange={(e) => setArea(e.target.value)} />
          <Input placeholder="Notes or context (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <Button type="button" variant="secondary" loading={isPending} onClick={runSummary}>
            {isPending ? "Reviewing…" : "Review Security"}
          </Button>
          {errorMessage && <p className="text-sm text-saddle-700">{errorMessage}</p>}
          {result && (
            <ResultBlock>
              <Field label="Findings" value={result.findings} />
              <Field label="Risk Level" value={result.riskLevel} />
              <Field label="Remediation Plan" value={result.remediationPlan} />
              <Field label="Permissions Review" value={result.permissionsReview} />
            </ResultBlock>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium">Backups</h2>
          <p className="mt-1 text-sm text-ink/70">
            Not something to fake with an AI feature — real backups here are handled at the infrastructure level:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink/70">
            <li>Database (Supabase Postgres) has automatic backups and point-in-time recovery, managed by Supabase directly.</li>
            <li>Deployments (Vercel) keep every past production build, so any release can be instantly rolled back.</li>
            <li>Code history is in git — every change is recoverable.</li>
          </ul>
        </Card>
      </div>

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="text-lg font-medium">AI Activity Log</h2>
          <p className="text-sm text-ink/70">Every AI assistant action across all agents is recorded here for auditing.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-ink/80">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-left font-medium">Title</th>
                <th className="px-3 py-2 text-left font-medium">User</th>
                <th className="px-3 py-2 text-left font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-ink/60">
                    No AI activity recorded yet.
                  </td>
                </tr>
              )}
              {recentLogs.map((log) => (
                <tr key={log.id} className="border-t border-cream-200">
                  <td className="px-3 py-3">{log.type}</td>
                  <td className="px-3 py-3">{log.title}</td>
                  <td className="px-3 py-3">{log.user?.email ?? "System"}</td>
                  <td className="px-3 py-3">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
