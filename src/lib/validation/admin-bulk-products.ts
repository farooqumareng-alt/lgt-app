import { z } from "zod";

// One row = one variant. Rows sharing the same product_sku are grouped into
// one product with multiple variants by the action that consumes this.
export const BulkProductRowSchema = z.object({
  product_sku: z.string().trim().min(2, { error: "product_sku is required." }),
  product_name: z.string().trim().min(2, { error: "product_name is required." }),
  category: z.string().trim().min(1, { error: "category is required." }),
  short_description: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().min(1, { error: "description is required." }),
  materials: z.string().trim().optional().or(z.literal("")),
  base_price_retail: z.coerce.number({ error: "base_price_retail must be a number." }).positive(),
  base_price_wholesale: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || v > 0, { error: "base_price_wholesale must be positive." }),
  is_customizable: z.string().trim().optional().or(z.literal("")),
  is_active: z.string().trim().optional().or(z.literal("")),
  is_featured: z.string().trim().optional().or(z.literal("")),
  variant_sku: z.string().trim().min(1, { error: "variant_sku is required." }),
  color: z.string().trim().optional().or(z.literal("")),
  size: z.string().trim().optional().or(z.literal("")),
  material: z.string().trim().optional().or(z.literal("")),
  price_retail_override: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? Number(v) : null)),
  price_wholesale_override: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? Number(v) : null)),
  stock_quantity: z.coerce.number({ error: "stock_quantity must be a number." }).int().min(0),
});

export type BulkProductRow = z.infer<typeof BulkProductRowSchema>;

export const BULK_PRODUCT_CSV_COLUMNS = [
  "product_sku",
  "product_name",
  "category",
  "short_description",
  "description",
  "materials",
  "base_price_retail",
  "base_price_wholesale",
  "is_customizable",
  "is_active",
  "is_featured",
  "variant_sku",
  "color",
  "size",
  "material",
  "price_retail_override",
  "price_wholesale_override",
  "stock_quantity",
] as const;
