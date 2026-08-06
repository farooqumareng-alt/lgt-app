"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { DeveloperAgentPanel } from "@/components/admin/ai/developer-agent-panel";
import { SeoAgentPanel } from "@/components/admin/ai/seo-agent-panel";
import { ContentAgentPanel } from "@/components/admin/ai/content-agent-panel";
import { BusinessAgentPanel } from "@/components/admin/ai/business-agent-panel";
import { SecurityAgentPanel } from "@/components/admin/ai/security-agent-panel";
import { ResultErrorBoundary } from "@/components/admin/ai/result-error-boundary";

const TABS = [
  { id: "developer", label: "Developer Agent" },
  { id: "seo", label: "SEO Agent" },
  { id: "content", label: "Content Agent" },
  { id: "business", label: "Business Agent" },
  { id: "security", label: "Security Agent" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type AiTabsProps = {
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

export function AiTabs({ userId, businessDataSummary, recentLogs }: AiTabsProps) {
  const [active, setActive] = useState<TabId>("seo");

  return (
    <div>
      <nav className="flex flex-wrap gap-1 border-b border-cream-200 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "rounded-sm px-3 py-2 text-sm font-medium transition-colors duration-150",
              active === tab.id ? "bg-saddle text-cream-50" : "text-ink/70 hover:bg-cream-200 hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        <ResultErrorBoundary key={active}>
          {active === "developer" && <DeveloperAgentPanel userId={userId} />}
          {active === "seo" && <SeoAgentPanel userId={userId} />}
          {active === "content" && <ContentAgentPanel userId={userId} />}
          {active === "business" && <BusinessAgentPanel userId={userId} businessDataSummary={businessDataSummary} />}
          {active === "security" && <SecurityAgentPanel userId={userId} recentLogs={recentLogs} />}
        </ResultErrorBoundary>
      </div>
    </div>
  );
}
