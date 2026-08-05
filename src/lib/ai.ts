import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Lazy, same principle as src/lib/stripe.ts / src/lib/email.ts — Next's
// build-time page-data collection imports every route; constructing this
// eagerly would fail the whole build if ANTHROPIC_API_KEY were missing at
// that moment, even though no request had happened yet.
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

const MODEL = "claude-sonnet-5";

const BRAND_VOICE =
  "You write product copy for Leather Goods Texas, a premium genuine-leather goods brand " +
  "(belts, wallets, keychains, purses, handbags) with a heritage, handcrafted, " +
  `"built to outlast trends" tone. Confident and warm, never salesy. No emojis, no exclamation ` +
  'points, no generic filler like "elevate your style" or "perfect for any occasion".';

export type ListingCopyInput = {
  name: string;
  categoryName: string;
  materials: string;
  isCustomizable: boolean;
};

export type ListingCopy = {
  shortDescription: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
};

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

export async function generateListingCopy(input: ListingCopyInput): Promise<ListingCopy> {
  const anthropic = getClient();

  const prompt = `${BRAND_VOICE}

Write listing copy for this product:
- Name: ${input.name}
- Category: ${input.categoryName}
- Materials: ${input.materials || "not specified"}
- Customizable with logo embossing: ${input.isCustomizable ? "yes" : "no"}

Respond with ONLY a JSON object (no markdown fences, no other text) with exactly these keys:
{
  "shortDescription": "one sentence, under 150 characters, for product grid cards",
  "description": "2-3 sentences, the full product page description",
  "metaTitle": "under 60 characters, SEO title tag",
  "metaDescription": "under 155 characters, SEO meta description"
}`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from the AI model.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(textBlock.text));
  } catch {
    throw new Error("AI response was not valid JSON.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as ListingCopy).shortDescription !== "string" ||
    typeof (parsed as ListingCopy).description !== "string" ||
    typeof (parsed as ListingCopy).metaTitle !== "string" ||
    typeof (parsed as ListingCopy).metaDescription !== "string"
  ) {
    throw new Error("AI response was missing expected fields.");
  }

  return parsed as ListingCopy;
}
