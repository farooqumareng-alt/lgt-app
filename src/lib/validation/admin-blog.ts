import { z } from "zod";

export const BlogPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, { error: "Slug is required." })
    .regex(/^[a-z0-9-]+$/, { error: "Slug can only contain lowercase letters, numbers, and hyphens." }),
  title: z.string().trim().min(2, { error: "Title is required." }),
  excerpt: z.string().trim().max(300).optional().or(z.literal("")),
  body: z.string().trim().min(1, { error: "Body is required." }),
  coverImageUrl: z.string().trim().max(2000).optional().or(z.literal("")),
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
});
