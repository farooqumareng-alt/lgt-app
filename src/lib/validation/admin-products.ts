import { z } from "zod";

const decimalField = (label: string) =>
  z.coerce.number({ error: `${label} must be a number.` }).positive({ error: `${label} must be positive.` });

const optionalDecimalField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((val) => (val ? Number(val) : null))
  .refine((val) => val === null || val > 0, { error: "Must be a positive number." });

export const ProductSchema = z.object({
  name: z.string().trim().min(2, { error: "Name is required." }),
  slug: z
    .string()
    .trim()
    .min(2, { error: "Slug is required." })
    .regex(/^[a-z0-9-]+$/, { error: "Slug can only contain lowercase letters, numbers, and hyphens." }),
  sku: z.string().trim().min(2, { error: "SKU is required." }),
  categoryId: z.string().trim().min(1, { error: "Category is required." }),
  shortDescription: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().min(1, { error: "Description is required." }),
  materials: z.string().trim().optional().or(z.literal("")),
  dimensions: z.string().trim().max(200).optional().or(z.literal("")),
  careInstructions: z.string().trim().max(2000).optional().or(z.literal("")),
  isCustomizable: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  basePriceRetail: decimalField("Retail price"),
  basePriceWholesale: optionalDecimalField,
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
});

export const VariantSchema = z.object({
  sku: z.string().trim().min(2, { error: "SKU is required." }),
  color: z.string().trim().optional().or(z.literal("")),
  size: z.string().trim().optional().or(z.literal("")),
  material: z.string().trim().optional().or(z.literal("")),
  priceRetailOverride: optionalDecimalField,
  priceWholesaleOverride: optionalDecimalField,
  stockQuantity: z.coerce.number({ error: "Stock must be a number." }).int().min(0),
  isActive: z.boolean().default(true),
});

export const PriceBreakSchema = z.object({
  minQuantity: z.coerce.number({ error: "Quantity must be a number." }).int().min(2, { error: "Minimum quantity must be at least 2." }),
  price: decimalField("Price"),
});
