"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateAdminDeveloperDiagnostics, generateAdminCodeReview } from "@/server/actions/admin-ai";
import type { AiDeveloperDiagnosticResult, AiCodeReviewResult } from "@/lib/admin-ai";

const textareaClass =
  "w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink font-mono focus-visible:border-saddle";

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

export function DeveloperAgentPanel({ userId }: { userId?: string }) {
  const [isPending, startTransition] = useTransition();
  const [issueDescription, setIssueDescription] = useState("");
  const [environment, setEnvironment] = useState("Production (Vercel)");
  const [logs, setLogs] = useState("");
  const [debugResult, setDebugResult] = useState<AiDeveloperDiagnosticResult | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);

  const [codeSnippet, setCodeSnippet] = useState("");
  const [focus, setFocus] = useState("correctness, security, and maintainability");
  const [reviewResult, setReviewResult] = useState<AiCodeReviewResult | null>(null);
  const [reviewPending, startReview] = useTransition();
  const [reviewError, setReviewError] = useState<string | null>(null);

  function runDebugger() {
    setDebugError(null);
    if (!issueDescription.trim() && !logs.trim()) {
      setDebugError("Describe the issue or paste an error/log first.");
      return;
    }
    startTransition(async () => {
      const result = await generateAdminDeveloperDiagnostics({ userId, issueDescription, environment, logs });
      if (!result.success) {
        setDebugError(result.message);
        return;
      }
      setDebugResult(result.result);
    });
  }

  function runCodeReview() {
    setReviewError(null);
    if (!codeSnippet.trim()) {
      setReviewError("Paste a code snippet first.");
      return;
    }
    startReview(async () => {
      const result = await generateAdminCodeReview({ userId, codeSnippet, focus });
      if (!result.success) {
        setReviewError(result.message);
        return;
      }
      setReviewResult(result.result);
    });
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <Card className="space-y-3 p-6">
        <div>
          <h2 className="text-lg font-medium">Debugger</h2>
          <p className="text-sm text-ink/70">
            Paste an error message, stack trace, or log output — get a diagnosis and suggested fix. This never
            touches the codebase; it&apos;s a suggestion for a human to review and apply.
          </p>
        </div>
        <Input placeholder="What's going wrong? (short description)" value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} />
        <Input placeholder="Environment (e.g. Production, local dev)" value={environment} onChange={(e) => setEnvironment(e.target.value)} />
        <textarea
          rows={5}
          placeholder="Paste error message, stack trace, or logs here…"
          value={logs}
          onChange={(e) => setLogs(e.target.value)}
          className={textareaClass}
        />
        <Button type="button" variant="secondary" loading={isPending} onClick={runDebugger}>
          {isPending ? "Diagnosing…" : "Diagnose"}
        </Button>
        {debugError && <p className="text-sm text-saddle-700">{debugError}</p>}
        {debugResult && (
          <ResultBlock>
            <Field label="Summary" value={debugResult.summary} />
            <Field label="Root Cause" value={debugResult.rootCause} />
            <Field label="Suggested Remediation" value={debugResult.remediation} />
            <Field label="Validation / Tests" value={debugResult.tests} />
          </ResultBlock>
        )}
      </Card>

      <Card className="space-y-3 p-6">
        <div>
          <h2 className="text-lg font-medium">Code Review</h2>
          <p className="text-sm text-ink/70">Paste a code snippet for feedback — issues, recommendations, and suggested changes as text, for you to apply.</p>
        </div>
        <textarea
          rows={7}
          placeholder="Paste code here…"
          value={codeSnippet}
          onChange={(e) => setCodeSnippet(e.target.value)}
          className={textareaClass}
        />
        <Input placeholder="Review focus (e.g. security, performance)" value={focus} onChange={(e) => setFocus(e.target.value)} />
        <Button type="button" variant="secondary" loading={reviewPending} onClick={runCodeReview}>
          {reviewPending ? "Reviewing…" : "Review Code"}
        </Button>
        {reviewError && <p className="text-sm text-saddle-700">{reviewError}</p>}
        {reviewResult && (
          <ResultBlock>
            <Field label="Summary" value={reviewResult.summary} />
            <Field label="Issues" value={reviewResult.issues} />
            <Field label="Recommendations" value={reviewResult.recommendations} />
            <Field label="Suggested Changes" value={reviewResult.suggestedChanges} />
          </ResultBlock>
        )}
      </Card>
    </div>
  );
}
