import { z } from "zod";

export const ContentPageSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, { error: "Slug is required." })
    .regex(/^[a-z0-9-]+$/, { error: "Slug can only contain lowercase letters, numbers, and hyphens." }),
  title: z.string().trim().min(2, { error: "Title is required." }),
  content: z.string().trim().min(1, { error: "Content is required." }),
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
  showInFooter: z.boolean().default(true),
});
