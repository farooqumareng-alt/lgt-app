import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5";

let client: Anthropic | undefined;

function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

async function callAnthropic(prompt: string): Promise<string> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    // These are short, structured content-generation tasks (return a fixed
    // set of JSON fields) — no deep reasoning needed. Without this, Sonnet 5's
    // extended thinking (on by default) can burn the entire max_tokens budget
    // on invisible thinking tokens before ever producing the answer text,
    // silently returning nothing. Confirmed directly: with thinking on,
    // stop_reason came back "max_tokens" with 1023 thinking_tokens and zero
    // text blocks; disabled, the same prompt returns cleanly in ~15 tokens.
    thinking: { type: "disabled" },
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from the AI model.");
  }

  return textBlock.text;
}

/**
 * Parses the model's JSON response and defensively normalizes it: every
 * expected field here is a string (or an array of strings, like `bullets`)
 * that gets rendered directly as React children. Models naturally tend to
 * return structured objects/arrays-of-objects for fields that read as
 * "structured" (JSON-LD schema markup, a list of "issues") rather than a
 * flat string — confirmed twice directly: schemaMarkup came back as a real
 * object, and separately `issues` came back as an array of
 * {type, description} objects instead of a string. Either crashes the whole
 * page with "Objects are not valid as a React child" since nothing here
 * expects to render one. Never trust the model's exact shape:
 * - a top-level plain-object value gets stringified
 * - a top-level array gets stringified UNLESS every element is already a
 *   string (preserves genuine string arrays like `bullets`)
 */
function parseJson<T>(text: string): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(text));
  } catch {
    throw new Error("AI response was not valid JSON.");
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== "object") continue;

      const isStringArray = Array.isArray(value) && value.every((item) => typeof item === "string");
      if (!isStringArray) {
        (parsed as Record<string, unknown>)[key] = JSON.stringify(value, null, 2);
      }
    }
  }

  return parsed as T;
}

export type AiSeoAuditResult = {
  titleTag: string;
  metaDescription: string;
  schemaMarkup: string;
  keywordSuggestions: string;
  recommendations: string;
};

export type AiContentDraft = {
  title: string;
  headline: string;
  body: string;
  metaTitle: string;
  metaDescription: string;
};

export type AiKeywordResearchResult = {
  primaryKeywords: string;
  longTailKeywords: string;
  searchIntent: string;
  contentIdeas: string;
};

export type AiSocialMediaDraftResult = {
  caption: string;
  hashtags: string;
  callToAction: string;
};

export type AiAnalyticsSummaryResult = {
  insights: string;
  trends: string;
  recommendations: string;
};

export type AiBlogPostResult = {
  headline: string;
  introduction: string;
  bullets: string[];
  conclusion: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
};

export type AiBusinessReportResult = {
  summary: string;
  opportunities: string;
  risks: string;
  recommendations: string;
};

export type AiSecuritySummaryResult = {
  findings: string;
  riskLevel: string;
  remediationPlan: string;
  permissionsReview: string;
};

export type AiDeveloperDiagnosticResult = {
  summary: string;
  rootCause: string;
  remediation: string;
  tests: string;
};

export type AiCodeReviewResult = {
  summary: string;
  issues: string;
  recommendations: string;
  suggestedChanges: string;
};

export async function generateSeoAudit(input: {
  pageUrl: string;
  existingContent: string;
  keywords: string;
  competitorUrls: string;
}): Promise<AiSeoAuditResult> {
  const prompt = `You are an AI SEO manager for an e-commerce website selling premium leather goods.
Analyze the page using this information, then produce a JSON object with exactly these keys: titleTag, metaDescription, schemaMarkup, keywordSuggestions, recommendations.

Page URL: ${input.pageUrl}
Keywords: ${input.keywords || "none provided"}
Competitors: ${input.competitorUrls || "none provided"}
Existing content: ${input.existingContent || "none"}

Title tag should be under 60 characters and optimized for search. Meta description should be under 155 characters. Schema markup should be valid JSON-LD for a product or web page. Keyword suggestions should be comma-separated phrases. Recommendations should be short, actionable SEO improvements.`;

  return parseJson<AiSeoAuditResult>(await callAnthropic(prompt));
}

export async function generateContentDraft(input: {
  pageType: string;
  audience: string;
  features: string;
  tone: string;
  callToAction: string;
}): Promise<AiContentDraft> {
  const prompt = `You are an AI content creator for a premium leather goods brand.
Write draft copy for a ${input.pageType} page targeting ${input.audience}.
Include a headline, body text, meta title, and meta description. Use the following features: ${input.features}. Use a ${input.tone} tone.
Return only JSON with keys: title, headline, body, metaTitle, metaDescription.`;

  return parseJson<AiContentDraft>(await callAnthropic(prompt));
}

export async function generateBlogPost(input: {
  topic: string;
  keywords: string;
  tone: string;
  audience: string;
}): Promise<AiBlogPostResult> {
  const prompt = `You are an AI blog writer for a premium leather goods brand.
Write an optimized blog post outline and content for the topic: ${input.topic}.
Target audience: ${input.audience}. Include these keywords: ${input.keywords}.
Use a ${input.tone} tone. Return only valid JSON with keys: headline, introduction, bullets, conclusion, seoMetaTitle, seoMetaDescription.`;

  return parseJson<AiBlogPostResult>(await callAnthropic(prompt));
}

export async function generateBusinessReport(input: {
  focus: string;
  dataSummary: string;
  timeframe: string;
}): Promise<AiBusinessReportResult> {
  const prompt = `You are a business intelligence assistant.
Create a short report for: ${input.focus}.
Data summary: ${input.dataSummary}.
Timeframe: ${input.timeframe}.
Return only JSON with keys: summary, opportunities, risks, recommendations.`;

  return parseJson<AiBusinessReportResult>(await callAnthropic(prompt));
}

export async function generateSecuritySummary(input: {
  area: string;
  note: string;
}): Promise<AiSecuritySummaryResult> {
  const prompt = `You are a security operations advisor.
Review the area: ${input.area} and note: ${input.note}.
Describe findings, risk level, remediation plan, and permissions review.
Return only JSON with keys: findings, riskLevel, remediationPlan, permissionsReview.`;

  return parseJson<AiSecuritySummaryResult>(await callAnthropic(prompt));
}

export async function generateDeveloperDiagnostics(input: {
  logs: string;
  issueDescription: string;
  environment: string;
}): Promise<AiDeveloperDiagnosticResult> {
  const prompt = `You are a senior developer and system diagnostician.
Analyze the following issue and logs, then produce a JSON object with exactly these keys: summary, rootCause, remediation, tests.

Issue description: ${input.issueDescription}
Environment: ${input.environment}
Logs and error details: ${input.logs}

Summarize the cause, explain the root issue, recommend the fix, and suggest validation/tests to confirm it is resolved.`;

  return parseJson<AiDeveloperDiagnosticResult>(await callAnthropic(prompt));
}

export async function generateCodeReview(input: {
  codeSnippet: string;
  focus: string;
}): Promise<AiCodeReviewResult> {
  const prompt = `You are a senior software engineer performing a code review.
Review the following code with a focus on: ${input.focus}.
Return only JSON with keys: summary, issues, recommendations, suggestedChanges.

Code snippet:
${input.codeSnippet}`;

  return parseJson<AiCodeReviewResult>(await callAnthropic(prompt));
}

export async function generateKeywordResearch(input: {
  topic: string;
  targetAudience: string;
  competitorFocus: string;
}): Promise<AiKeywordResearchResult> {
  const prompt = `You are an SEO keyword research specialist for a premium leather goods e-commerce brand.
Research keyword opportunities for: ${input.topic}.
Target audience: ${input.targetAudience || "general shoppers"}.
Competitor angle to consider: ${input.competitorFocus || "none provided"}.
Return only JSON with keys: primaryKeywords (comma-separated high-intent phrases), longTailKeywords (comma-separated longer phrases), searchIntent (short description of what searchers want), contentIdeas (short list of content/page ideas that could rank, as a single string).`;

  return parseJson<AiKeywordResearchResult>(await callAnthropic(prompt));
}

export async function generateSocialMediaDraft(input: {
  productOrTopic: string;
  platform: string;
  tone: string;
}): Promise<AiSocialMediaDraftResult> {
  const prompt = `You are a social media copywriter for a premium leather goods brand.
Write a ${input.platform} post about: ${input.productOrTopic}.
Use a ${input.tone} tone.
Return only JSON with keys: caption (the post text), hashtags (space-separated hashtags), callToAction (a short closing line).`;

  return parseJson<AiSocialMediaDraftResult>(await callAnthropic(prompt));
}

export async function generateAnalyticsSummary(input: {
  dataSummary: string;
}): Promise<AiAnalyticsSummaryResult> {
  // The admin already sees these exact figures as real charts rendered
  // directly from the database, next to this text (see business-agent-panel.tsx)
  // — so this prompt is scoped to qualitative interpretation, not restating
  // numbers. Keeps the model from ever being the source of a number an admin
  // could act on; it only ever comments on numbers the UI already shows.
  const prompt = `You are a business intelligence analyst reviewing real, current data for a leather goods e-commerce business.
Here is the actual current business data snapshot:
${input.dataSummary}

The admin viewing your response can already see these exact numbers as charts — do not restate figures or repeat the raw data back. Analyze this real data (not a hypothetical) and return only JSON with keys: insights (what's notable about these numbers that isn't obvious from a glance at the chart), trends (patterns worth watching over time, not visible in a single snapshot), recommendations (specific, actionable next steps based on this exact data). Keep each field to 2-3 sentences of interpretation, not a numbers recap.`;

  return parseJson<AiAnalyticsSummaryResult>(await callAnthropic(prompt));
}
