"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  generateAdminSeoAudit,
  generateAdminPageContent,
  generateAdminBlogPost,
  generateAdminBusinessReport,
  generateAdminSecuritySummary,
  type AiActionResult,
} from "@/server/actions/admin-ai";
import type {
  AiSeoAuditResult,
  AiContentDraft,
  AiBlogPostResult,
  AiBusinessReportResult,
  AiSecuritySummaryResult,
} from "@/lib/admin-ai";

type AiDashboardProps = {
  userId?: string;
  recentLogs: Array<{ id: string; type: string; title: string; createdAt: string; user?: { email?: string | null; name?: string | null } | null }>;
};

export function AiDashboard({ userId, recentLogs }: AiDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [seoResult, setSeoResult] = useState<AiSeoAuditResult | null>(null);
  const [pageResult, setPageResult] = useState<AiContentDraft | null>(null);
  const [blogResult, setBlogResult] = useState<AiBlogPostResult | null>(null);
  const [reportResult, setReportResult] = useState<AiBusinessReportResult | null>(null);
  const [securityResult, setSecurityResult] = useState<AiSecuritySummaryResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSeoAudit() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await generateAdminSeoAudit({
        userId,
        pageUrl: "/shop/belts/heritage-full-grain-belt",
        existingContent: "A classic leather belt with fine stitching, brass buckle, and rich vegetable-tanned leather.",
        keywords: "leather belt, handcrafted belt, premium belt",
        competitorUrls: "",
      });
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      setSeoResult(result.result);
    });
  }

  function handlePageContent() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await generateAdminPageContent({
        userId,
        pageType: "landing",
        audience: "style-conscious shoppers",
        features: "handcrafted leather, lifetime durability, customizable embossing",
        tone: "confident and warm",
        callToAction: "Shop the heritage collection",
      });
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      setPageResult(result.result);
    });
  }

  function handleBlogPost() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await generateAdminBlogPost({
        userId,
        topic: "How to care for leather goods",
        keywords: "leather care, leather maintenance, leather conditioner",
        tone: "educational and reassuring",
        audience: "owners of premium leather accessories",
      });
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      setBlogResult(result.result);
    });
  }

  function handleBusinessReport() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await generateAdminBusinessReport({
        userId,
        focus: "low stock risk across best-selling wallets",
        dataSummary: "Inventory levels are below threshold for top categories, with wholesale orders increasing by 24% this quarter.",
        timeframe: "last 30 days",
      });
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      setReportResult(result.result);
    });
  }

  function handleSecuritySummary() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await generateAdminSecuritySummary({
        userId,
        area: "admin access and role permissions",
        note: "Ensure only approved administrators can perform AI-driven content changes and system fixes.",
      });
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }
      setSecurityResult(result.result);
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl">Admin AI Command Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink/70">
              Execute AI-powered diagnostics, content generation, SEO auditing, business reporting, and security summaries from one control panel.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" loading={isPending} onClick={handleSeoAudit}>
              Run SEO Audit
            </Button>
            <Button variant="secondary" loading={isPending} onClick={handleBusinessReport}>
              Generate Report
            </Button>
          </div>
        </div>

        {errorMessage && <p className="mt-4 text-sm text-rose-700">{errorMessage}</p>}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-lg">SEO Agent</h2>
              <p className="text-sm text-ink/70">Keyword research, metadata, schema markup, and page recommendations.</p>
            </div>
            <Button variant="secondary" loading={isPending} onClick={handleSeoAudit}>
              Run Audit
            </Button>
          </div>

          {seoResult ? (
            <div className="space-y-3 rounded-sm bg-cream-50 p-4 text-sm text-ink/80">
              <p className="font-semibold text-ink">Title Tag</p>
              <p>{seoResult.titleTag}</p>
              <p className="font-semibold text-ink">Meta Description</p>
              <p>{seoResult.metaDescription}</p>
              <p className="font-semibold text-ink">Schema Markup</p>
              <pre className="whitespace-pre-wrap rounded-sm bg-cream-100 p-3 text-xs">{seoResult.schemaMarkup}</pre>
              <p className="font-semibold text-ink">Keyword Suggestions</p>
              <p>{seoResult.keywordSuggestions}</p>
              <p className="font-semibold text-ink">Recommendations</p>
              <p>{seoResult.recommendations}</p>
            </div>
          ) : (
            <p className="text-sm text-ink/70">Use the SEO agent to generate page metadata, schema, and optimization guidance.</p>
          )}
        </Card>

        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-lg">Content Agent</h2>
              <p className="text-sm text-ink/70">Create landing pages, blog content, and social media copy instantly.</p>
            </div>
            <Button variant="secondary" loading={isPending} onClick={handlePageContent}>
              Draft Page
            </Button>
          </div>

          {pageResult ? (
            <div className="space-y-3 rounded-sm bg-cream-50 p-4 text-sm text-ink/80">
              <p className="font-semibold text-ink">Page Title</p>
              <p>{pageResult.title}</p>
              <p className="font-semibold text-ink">Headline</p>
              <p>{pageResult.headline}</p>
              <p className="font-semibold text-ink">Body</p>
              <p>{pageResult.body}</p>
              <p className="font-semibold text-ink">Meta Title</p>
              <p>{pageResult.metaTitle}</p>
              <p className="font-semibold text-ink">Meta Description</p>
              <p>{pageResult.metaDescription}</p>
            </div>
          ) : (
            <p className="text-sm text-ink/70">Generate draft page copy for marketing, product, or landing pages.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-lg">SEO Blog Writer</h2>
              <p className="text-sm text-ink/70">Generate a blog outline, introduction, bullets, and SEO metadata.</p>
            </div>
            <Button variant="secondary" loading={isPending} onClick={handleBlogPost}>
              Write Blog
            </Button>
          </div>

          {blogResult ? (
            <div className="space-y-3 rounded-sm bg-cream-50 p-4 text-sm text-ink/80">
              <p className="font-semibold text-ink">Headline</p>
              <p>{blogResult.headline}</p>
              <p className="font-semibold text-ink">Introduction</p>
              <p>{blogResult.introduction}</p>
              <p className="font-semibold text-ink">Bullets</p>
              <ul className="list-disc space-y-2 pl-5">
                {blogResult.bullets.map((bullet, index) => (
                  <li key={index}>{bullet}</li>
                ))}
              </ul>
              <p className="font-semibold text-ink">Conclusion</p>
              <p>{blogResult.conclusion}</p>
              <p className="font-semibold text-ink">SEO Meta Title</p>
              <p>{blogResult.seoMetaTitle}</p>
              <p className="font-semibold text-ink">SEO Meta Description</p>
              <p>{blogResult.seoMetaDescription}</p>
            </div>
          ) : (
            <p className="text-sm text-ink/70">Generate long-form content that supports your organic traffic goals.</p>
          )}
        </Card>

        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-lg">Business & Security</h2>
              <p className="text-sm text-ink/70">Run business intelligence and quick security summaries for admin operations.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" loading={isPending} onClick={handleSecuritySummary}>
                Review Security
              </Button>
            </div>
          </div>

          {reportResult ? (
            <div className="space-y-3 rounded-sm bg-cream-50 p-4 text-sm text-ink/80">
              <p className="font-semibold text-ink">Summary</p>
              <p>{reportResult.summary}</p>
              <p className="font-semibold text-ink">Opportunities</p>
              <p>{reportResult.opportunities}</p>
              <p className="font-semibold text-ink">Risks</p>
              <p>{reportResult.risks}</p>
              <p className="font-semibold text-ink">Recommendations</p>
              <p>{reportResult.recommendations}</p>
            </div>
          ) : (
            <p className="text-sm text-ink/70">Run business intelligence for inventory, revenue, demand, and risk insights.</p>
          )}

          {securityResult ? (
            <div className="space-y-3 rounded-sm bg-cream-50 p-4 text-sm text-ink/80">
              <p className="font-semibold text-ink">Findings</p>
              <p>{securityResult.findings}</p>
              <p className="font-semibold text-ink">Risk Level</p>
              <p>{securityResult.riskLevel}</p>
              <p className="font-semibold text-ink">Remediation</p>
              <p>{securityResult.remediationPlan}</p>
              <p className="font-semibold text-ink">Permissions Review</p>
              <p>{securityResult.permissionsReview}</p>
            </div>
          ) : null}
        </Card>
      </div>

      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-lg">AI Activity Log</h2>
            <p className="text-sm text-ink/70">Recent AI assistant actions are recorded for auditing and review.</p>
          </div>
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
