"use server";

import { requireRole } from "@/lib/dal";
import { generateListingCopy, type ListingCopy } from "@/lib/ai";
import type { Prisma } from "@/generated/prisma/client";
import {
  createAiActivityLog,
} from "@/server/repositories/admin-ai-logs";
import {
  generateSeoAudit,
  generateContentDraft,
  generateBlogPost,
  generateBusinessReport,
  generateSecuritySummary,
  generateDeveloperDiagnostics,
  generateCodeReview,
  type AiSeoAuditResult,
  type AiContentDraft,
  type AiBlogPostResult,
  type AiBusinessReportResult,
  type AiSecuritySummaryResult,
  type AiDeveloperDiagnosticResult,
  type AiCodeReviewResult,
} from "@/lib/admin-ai";

export type GenerateListingCopyResult = { success: true; copy: ListingCopy } | { success: false; message: string };
export type AiActionResult<T> = { success: true; result: T } | { success: false; message: string };

async function auditAndLog<T extends Prisma.InputJsonValue>(
  userId: string | undefined,
  type: string,
  title: string,
  input: Prisma.InputJsonValue,
  getResult: () => Promise<T>,
): Promise<AiActionResult<T>> {
  await requireRole("ADMIN");
  try {
    const result = await getResult();
    await createAiActivityLog({ userId: userId ?? null, type, title, input, output: result });
    return { success: true, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI generation failed.";
    return { success: false, message };
  }
}

export async function generateProductListingCopy(input: {
  name: string;
  categoryName: string;
  materials: string;
  isCustomizable: boolean;
}): Promise<GenerateListingCopyResult> {
  await requireRole("ADMIN");

  if (!input.name.trim()) {
    return { success: false, message: "Enter a product name first." };
  }
  if (!input.categoryName.trim()) {
    return { success: false, message: "Select a category first." };
  }

  try {
    const copy = await generateListingCopy(input);
    return { success: true, copy };
  } catch (error) {
    console.error("generateProductListingCopy failed:", error);
    return { success: false, message: "AI generation failed — please try again or write the copy manually." };
  }
}

export async function generateAdminSeoAudit(input: {
  userId?: string;
  pageUrl: string;
  existingContent: string;
  keywords: string;
  competitorUrls: string;
}): Promise<AiActionResult<AiSeoAuditResult>> {
  return auditAndLog(input.userId, "SEO Audit", input.pageUrl, input, () =>
    generateSeoAudit({
      pageUrl: input.pageUrl,
      existingContent: input.existingContent,
      keywords: input.keywords,
      competitorUrls: input.competitorUrls,
    }),
  );
}

export async function generateAdminPageContent(input: {
  userId?: string;
  pageType: string;
  audience: string;
  features: string;
  tone: string;
  callToAction: string;
}): Promise<AiActionResult<AiContentDraft>> {
  return auditAndLog(input.userId, "Page Content", `${input.pageType} page draft`, input, () =>
    generateContentDraft({
      pageType: input.pageType,
      audience: input.audience,
      features: input.features,
      tone: input.tone,
      callToAction: input.callToAction,
    }),
  );
}

export async function generateAdminBlogPost(input: {
  userId?: string;
  topic: string;
  keywords: string;
  tone: string;
  audience: string;
}): Promise<AiActionResult<AiBlogPostResult>> {
  return auditAndLog(input.userId, "Blog Writer", input.topic, input, () =>
    generateBlogPost({
      topic: input.topic,
      keywords: input.keywords,
      tone: input.tone,
      audience: input.audience,
    }),
  );
}

export async function generateAdminBusinessReport(input: {
  userId?: string;
  focus: string;
  dataSummary: string;
  timeframe: string;
}): Promise<AiActionResult<AiBusinessReportResult>> {
  return auditAndLog(input.userId, "Business Report", input.focus, input, () =>
    generateBusinessReport({
      focus: input.focus,
      dataSummary: input.dataSummary,
      timeframe: input.timeframe,
    }),
  );
}

export async function generateAdminSecuritySummary(input: {
  userId?: string;
  area: string;
  note: string;
}): Promise<AiActionResult<AiSecuritySummaryResult>> {
  return auditAndLog(input.userId, "Security Summary", input.area, input, () =>
    generateSecuritySummary({
      area: input.area,
      note: input.note,
    }),
  );
}

export async function generateAdminDeveloperDiagnostics(input: {
  userId?: string;
  logs: string;
  issueDescription: string;
  environment: string;
}): Promise<AiActionResult<AiDeveloperDiagnosticResult>> {
  return auditAndLog(input.userId, "Developer Diagnostics", input.issueDescription, input, () =>
    generateDeveloperDiagnostics({
      logs: input.logs,
      issueDescription: input.issueDescription,
      environment: input.environment,
    }),
  );
}

export async function generateAdminCodeReview(input: {
  userId?: string;
  codeSnippet: string;
  focus: string;
}): Promise<AiActionResult<AiCodeReviewResult>> {
  return auditAndLog(input.userId, "Code Review", input.focus, input, () =>
    generateCodeReview({
      codeSnippet: input.codeSnippet,
      focus: input.focus,
    }),
  );
}
