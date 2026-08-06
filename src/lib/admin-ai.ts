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
 * expected field here is a string (or array of strings) that gets rendered
 * directly as React children. Models asked for something like "valid
 * JSON-LD" naturally tend to return an actual nested object for that field
 * rather than a JSON-encoded string — confirmed directly (schemaMarkup came
 * back as a real object), which crashes the whole page with "Objects are
 * not valid as a React child" since nothing here expects to render one. Any
 * top-level plain-object value gets stringified rather than trusted as-is.
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
      if (value && typeof value === "object" && !Array.isArray(value)) {
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
