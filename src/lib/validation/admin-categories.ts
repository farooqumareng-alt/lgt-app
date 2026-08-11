import { z } from "zod";

// The form's help text shows "/shop/{slug}" so admins know where the page
// ends up — which invites typing the full path back in instead of just the
// last segment. Rather than reject that outright, strip a leading "/shop/"
// (or a bare leading/trailing slash) before validating, so the obvious
// mistake self-corrects instead of silently failing.
function stripShopPrefix(value: string): string {
  return value.replace(/^\/?(shop\/)?/, "").replace(/\/$/, "");
}

export const CategorySchema = z.object({
  name: z.string().trim().min(2, { error: "Name is required." }),
  urlSlug: z
    .string()
    .trim()
    .transform(stripShopPrefix)
    .pipe(
      z
        .string()
        .min(2, { error: "URL slug is required." })
        .regex(/^[a-z0-9-]+$/, { error: "URL slug can only contain lowercase letters, numbers, and hyphens." }),
    ),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
});
