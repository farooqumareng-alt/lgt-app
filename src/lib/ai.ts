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

export type ProductImageAnalysisInput = {
  imageUrl: string;
  productName?: string;
  categoryName?: string;
};

export type ProductImageAnalysis = {
  shortDescription: string;
  description: string;
  suggestedMaterials: string;
  metaTitle: string;
  metaDescription: string;
  imageFeedback: string;
};

// Claude Sonnet 5 is multimodal — this passes the image straight through by
// URL (our product photos are already public Vercel Blob URLs, so no need
// to fetch and re-encode as base64). Still returns a suggestion, never
// applies anything itself — the admin reviews and fills the form, same
// "suggest, human applies" boundary as every other AI tool in this admin
// panel.
export async function analyzeProductImage(input: ProductImageAnalysisInput): Promise<ProductImageAnalysis> {
  const anthropic = getClient();

  const prompt = `${BRAND_VOICE}

Look at this product photo${input.productName ? ` of "${input.productName}"` : ""}${
    input.categoryName ? ` (category: ${input.categoryName})` : ""
  } and do two separate things:

1. Write listing copy based on what you actually see in the photo — color, hardware, stitching,
   texture, and any other visible details. Don't invent details you can't see. For materials: a
   photo can tell you hardware finish/color and general leather texture, but NOT tannage or
   authenticity (e.g. full-grain vs. genuine vs. bonded) — describe what's visually apparent
   (color, hardware tone, grain texture) rather than asserting a specific leather grade unless the
   product name given to you already states it.
2. Give brief, honest feedback on the PHOTO ITSELF as an e-commerce product image — lighting,
   background, framing, and whether it looks professional enough for a live product page. If it
   already looks good, say so plainly rather than inventing a problem.

Respond with ONLY a JSON object (no markdown fences, no other text) with exactly these keys:
{
  "shortDescription": "one sentence, under 150 characters, for product grid cards",
  "description": "2-3 sentences, the full product page description, based on what's visible",
  "suggestedMaterials": "comma-separated list of materials/hardware visible in the photo",
  "metaTitle": "under 60 characters, SEO title tag",
  "metaDescription": "under 155 characters, SEO meta description",
  "imageFeedback": "2-3 sentences of honest, actionable feedback on the photo's lighting, background, and framing"
}`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: "disabled" },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: input.imageUrl } },
          { type: "text", text: prompt },
        ],
      },
    ],
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
    typeof (parsed as ProductImageAnalysis).shortDescription !== "string" ||
    typeof (parsed as ProductImageAnalysis).description !== "string" ||
    typeof (parsed as ProductImageAnalysis).suggestedMaterials !== "string" ||
    typeof (parsed as ProductImageAnalysis).metaTitle !== "string" ||
    typeof (parsed as ProductImageAnalysis).metaDescription !== "string" ||
    typeof (parsed as ProductImageAnalysis).imageFeedback !== "string"
  ) {
    throw new Error("AI response was missing expected fields.");
  }

  return parsed as ProductImageAnalysis;
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
    max_tokens: 2048,
    // See src/lib/admin-ai.ts's callAnthropic for why this matters: without
    // it, Sonnet 5's extended thinking (on by default) can consume the whole
    // max_tokens budget on invisible reasoning before producing any answer
    // text, for a task simple enough not to need it.
    thinking: { type: "disabled" },
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
