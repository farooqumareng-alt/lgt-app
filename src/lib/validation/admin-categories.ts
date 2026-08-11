import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().trim().min(2, { error: "Name is required." }),
  urlSlug: z
    .string()
    .trim()
    .min(2, { error: "URL slug is required." })
    .regex(/^[a-z0-9-]+$/, { error: "URL slug can only contain lowercase letters, numbers, and hyphens." }),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
});
