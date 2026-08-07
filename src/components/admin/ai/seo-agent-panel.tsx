"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { generateAdminSeoAudit, generateAdminBlogPost, generateAdminKeywordResearch } from "@/server/actions/admin-ai";
import { createBlogPostDraftFromAi } from "@/server/actions/admin-blog";
import type { AiSeoAuditResult, AiBlogPostResult, AiKeywordResearchResult } from "@/lib/admin-ai";

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

export function SeoAgentPanel({ userId }: { userId?: string }) {
  // SEO Auditor
  const [pageUrl, setPageUrl] = useState("/shop/belts/heritage-full-grain-belt");
  const [existingContent, setExistingContent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [auditResult, setAuditResult] = useState<AiSeoAuditResult | null>(null);
  const [auditPending, startAudit] = useTransition();
  const [auditError, setAuditError] = useState<string | null>(null);

  // Blog Writer
  const [blogTopic, setBlogTopic] = useState("");
  const [blogKeywords, setBlogKeywords] = useState("");
  const [blogResult, setBlogResult] = useState<AiBlogPostResult | null>(null);
  const [blogPending, startBlog] = useTransition();
  const [blogError, setBlogError] = useState<string | null>(null);

  // Keyword Research
  const [krTopic, setKrTopic] = useState("");
  const [krAudience, setKrAudience] = useState("");
  const [krResult, setKrResult] = useState<AiKeywordResearchResult | null>(null);
  const [krPending, startKr] = useTransition();
  const [krError, setKrError] = useState<string | null>(null);

  function runAudit() {
    setAuditError(null);
    if (!pageUrl.trim()) return setAuditError("Enter a page URL first.");
    startAudit(async () => {
      const result = await generateAdminSeoAudit({ userId, pageUrl, existingContent, keywords, competitorUrls: "" });
      if (!result.success) return setAuditError(result.message);
      setAuditResult(result.result);
    });
  }

  function runBlog() {
    setBlogError(null);
    if (!blogTopic.trim()) return setBlogError("Enter a blog topic first.");
    startBlog(async () => {
      const result = await generateAdminBlogPost({
        userId,
        topic: blogTopic,
        keywords: blogKeywords,
        tone: "confident and warm",
        audience: "owners of premium leather accessories",
      });
      if (!result.success) return setBlogError(result.message);
      setBlogResult(result.result);
    });
  }

  function runKeywordResearch() {
    setKrError(null);
    if (!krTopic.trim()) return setKrError("Enter a topic or product first.");
    startKr(async () => {
      const result = await generateAdminKeywordResearch({ userId, topic: krTopic, targetAudience: krAudience, competitorFocus: "" });
      if (!result.success) return setKrError(result.message);
      setKrResult(result.result);
    });
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <Card className="space-y-3 p-6">
        <h2 className="text-lg font-medium">SEO Auditor</h2>
        <p className="text-sm text-ink/70">Title tag, meta description, schema markup, and recommendations for a page.</p>
        <Input placeholder="Page URL (e.g. /shop/belts/...)" value={pageUrl} onChange={(e) => setPageUrl(e.target.value)} />
        <Input placeholder="Target keywords (optional)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        <textarea
          rows={3}
          placeholder="Existing page content (optional)"
          value={existingContent}
          onChange={(e) => setExistingContent(e.target.value)}
          className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
        />
        <Button type="button" variant="secondary" loading={auditPending} onClick={runAudit}>
          {auditPending ? "Auditing…" : "Run Audit"}
        </Button>
        {auditError && <p className="text-sm text-saddle-700">{auditError}</p>}
        {auditResult && (
          <ResultBlock>
            <Field label="Title Tag" value={auditResult.titleTag} />
            <Field label="Meta Description" value={auditResult.metaDescription} />
            <p className="font-semibold text-ink">Schema Markup</p>
            <pre className="whitespace-pre-wrap rounded-sm bg-cream-100 p-3 text-xs">{auditResult.schemaMarkup}</pre>
            <Field label="Keyword Suggestions" value={auditResult.keywordSuggestions} />
            <Field label="Recommendations" value={auditResult.recommendations} />
          </ResultBlock>
        )}
      </Card>

      <Card className="space-y-3 p-6">
        <h2 className="text-lg font-medium">Keyword Research</h2>
        <p className="text-sm text-ink/70">Primary and long-tail keyword opportunities for a topic or product.</p>
        <Input placeholder="Topic or product (e.g. leather weekender bags)" value={krTopic} onChange={(e) => setKrTopic(e.target.value)} />
        <Input placeholder="Target audience (optional)" value={krAudience} onChange={(e) => setKrAudience(e.target.value)} />
        <Button type="button" variant="secondary" loading={krPending} onClick={runKeywordResearch}>
          {krPending ? "Researching…" : "Research Keywords"}
        </Button>
        {krError && <p className="text-sm text-saddle-700">{krError}</p>}
        {krResult && (
          <ResultBlock>
            <Field label="Primary Keywords" value={krResult.primaryKeywords} />
            <Field label="Long-Tail Keywords" value={krResult.longTailKeywords} />
            <Field label="Search Intent" value={krResult.searchIntent} />
            <Field label="Content Ideas" value={krResult.contentIdeas} />
          </ResultBlock>
        )}
      </Card>

      <Card className="space-y-3 p-6 xl:col-span-2">
        <h2 className="text-lg font-medium">Blog Writer</h2>
        <p className="text-sm text-ink/70">Full blog outline, introduction, bullets, conclusion, and SEO metadata.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Blog topic" value={blogTopic} onChange={(e) => setBlogTopic(e.target.value)} />
          <Input placeholder="Keywords (optional)" value={blogKeywords} onChange={(e) => setBlogKeywords(e.target.value)} />
        </div>
        <Button type="button" variant="secondary" loading={blogPending} onClick={runBlog}>
          {blogPending ? "Writing…" : "Write Blog"}
        </Button>
        {blogError && <p className="text-sm text-saddle-700">{blogError}</p>}
        {blogResult && (
          <ResultBlock>
            <Field label="Headline" value={blogResult.headline} />
            <Field label="Introduction" value={blogResult.introduction} />
            <div>
              <p className="font-semibold text-ink">Bullets</p>
              <ul className="list-disc space-y-1 pl-5">
                {/* Defensive: the model occasionally returns a single string instead of
                    an array for list-shaped fields — never trust the exact shape. */}
                {(Array.isArray(blogResult.bullets) ? blogResult.bullets : [blogResult.bullets]).map(
                  (bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ),
                )}
              </ul>
            </div>
            <Field label="Conclusion" value={blogResult.conclusion} />
            <Field label="SEO Meta Title" value={blogResult.seoMetaTitle} />
            <Field label="SEO Meta Description" value={blogResult.seoMetaDescription} />
            <form action={createBlogPostDraftFromAi.bind(null, blogTopic, blogResult)}>
              <SubmitButton pendingLabel="Creating draft…">Create as Draft</SubmitButton>
              <p className="mt-1 text-xs text-ink/50">
                Saves this as an unpublished post under Admin → Blog for you to review, edit, and
                publish — nothing goes live automatically.
              </p>
            </form>
          </ResultBlock>
        )}
      </Card>
    </div>
  );
}
