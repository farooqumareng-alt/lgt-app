import "server-only";

export type ImageGenInput = { prompt: string };

export type ImageGenResult = {
  imageBuffer: Buffer;
  contentType: string;
  provider: "openai" | "google";
};

type Provider = {
  name: "openai" | "google";
  isConfigured: () => boolean;
  generate: (input: ImageGenInput) => Promise<ImageGenResult>;
};

async function generateWithOpenAI(input: ImageGenInput): Promise<ImageGenResult> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt: input.prompt,
    size: "1024x1024",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image data.");

  return { imageBuffer: Buffer.from(b64, "base64"), contentType: "image/png", provider: "openai" };
}

async function generateWithGoogle(input: ImageGenInput): Promise<ImageGenResult> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: input.prompt }],
        parameters: { sampleCount: 1 },
      }),
    },
  );

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Google image generation failed (${res.status}): ${errorBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("Google returned no image data.");

  return { imageBuffer: Buffer.from(b64, "base64"), contentType: "image/png", provider: "google" };
}

const PROVIDERS: Provider[] = [
  { name: "openai", isConfigured: () => !!process.env.OPENAI_API_KEY, generate: generateWithOpenAI },
  { name: "google", isConfigured: () => !!process.env.GOOGLE_AI_API_KEY, generate: generateWithGoogle },
];

/** Picks randomly among whichever providers have a key configured. */
export async function generateProductImage(input: ImageGenInput): Promise<ImageGenResult> {
  const available = PROVIDERS.filter((p) => p.isConfigured());
  if (available.length === 0) {
    throw new Error("No image-generation provider is configured (set OPENAI_API_KEY and/or GOOGLE_AI_API_KEY).");
  }
  const chosen = available[Math.floor(Math.random() * available.length)];
  return chosen.generate(input);
}
