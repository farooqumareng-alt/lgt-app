"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateAdminPageContent, generateAdminSocialMediaDraft } from "@/server/actions/admin-ai";
import type { AiContentDraft, AiSocialMediaDraftResult } from "@/lib/admin-ai";

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

const PLATFORMS = ["Instagram", "Facebook", "Pinterest", "X / Twitter"];

export function ContentAgentPanel({ userId }: { userId?: string }) {
  const [pageType, setPageType] = useState("landing");
  const [features, setFeatures] = useState("");
  const [callToAction, setCallToAction] = useState("Shop the collection");
  const [pageResult, setPageResult] = useState<AiContentDraft | null>(null);
  const [pagePending, startPage] = useTransition();
  const [pageError, setPageError] = useState<string | null>(null);

  const [productOrTopic, setProductOrTopic] = useState("");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [socialResult, setSocialResult] = useState<AiSocialMediaDraftResult | null>(null);
  const [socialPending, startSocial] = useTransition();
  const [socialError, setSocialError] = useState<string | null>(null);

  function runPageDraft() {
    setPageError(null);
    if (!features.trim()) return setPageError("Describe what this page should cover first.");
    startPage(async () => {
      const result = await generateAdminPageContent({
        userId,
        pageType,
        audience: "style-conscious shoppers",
        features,
        tone: "confident and warm",
        callToAction,
      });
      if (!result.success) return setPageError(result.message);
      setPageResult(result.result);
    });
  }

  function runSocialDraft() {
    setSocialError(null);
    if (!productOrTopic.trim()) return setSocialError("Enter a product or topic first.");
    startSocial(async () => {
      const result = await generateAdminSocialMediaDraft({
        userId,
        productOrTopic,
        platform,
        tone: "confident and warm",
      });
      if (!result.success) return setSocialError(result.message);
      setSocialResult(result.result);
    });
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <Card className="space-y-3 p-6">
        <h2 className="text-lg font-medium">Pages</h2>
        <p className="text-sm text-ink/70">Draft headline, body, and meta copy for a landing or marketing page.</p>
        <Input placeholder="Page type (e.g. landing, product, about)" value={pageType} onChange={(e) => setPageType(e.target.value)} />
        <textarea
          rows={3}
          placeholder="What should this page cover? (features, story, offer)"
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
        />
        <Input placeholder="Call to action" value={callToAction} onChange={(e) => setCallToAction(e.target.value)} />
        <Button type="button" variant="secondary" loading={pagePending} onClick={runPageDraft}>
          {pagePending ? "Drafting…" : "Draft Page"}
        </Button>
        {pageError && <p className="text-sm text-saddle-700">{pageError}</p>}
        {pageResult && (
          <ResultBlock>
            <Field label="Page Title" value={pageResult.title} />
            <Field label="Headline" value={pageResult.headline} />
            <Field label="Body" value={pageResult.body} />
            <Field label="Meta Title" value={pageResult.metaTitle} />
            <Field label="Meta Description" value={pageResult.metaDescription} />
          </ResultBlock>
        )}
      </Card>

      <Card className="space-y-3 p-6">
        <h2 className="text-lg font-medium">Social Media</h2>
        <p className="text-sm text-ink/70">A caption, hashtags, and call to action for a product or announcement.</p>
        <Input placeholder="Product or topic" value={productOrTopic} onChange={(e) => setProductOrTopic(e.target.value)} />
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <Button type="button" variant="secondary" loading={socialPending} onClick={runSocialDraft}>
          {socialPending ? "Drafting…" : "Draft Post"}
        </Button>
        {socialError && <p className="text-sm text-saddle-700">{socialError}</p>}
        {socialResult && (
          <ResultBlock>
            <Field label="Caption" value={socialResult.caption} />
            <Field label="Hashtags" value={socialResult.hashtags} />
            <Field label="Call to Action" value={socialResult.callToAction} />
          </ResultBlock>
        )}
      </Card>

      <Card className="p-6 xl:col-span-2">
        <h2 className="text-lg font-medium">Images</h2>
        <p className="mt-1 text-sm text-ink/70">
          AI-generated placeholder product photos live on each product&apos;s edit page, tied to that specific
          product — not a generic demo here.
        </p>
        <Link href="/admin/products" className="mt-3 inline-block text-sm font-medium text-saddle hover:underline">
          Go to Products →
        </Link>
      </Card>
    </div>
  );
}
