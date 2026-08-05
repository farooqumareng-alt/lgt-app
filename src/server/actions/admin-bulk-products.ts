"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BulkProductRowSchema, type BulkProductRow } from "@/lib/validation/admin-bulk-products";

export type BulkUploadRowResult = {
  productSku: string;
  variantSku: string;
  status: "created" | "updated" | "error";
  message?: string;
};

export type BulkUploadResult = {
  results: BulkUploadRowResult[];
  productsAffected: number;
};

const truthy = (v: string | undefined) => v?.trim().toLowerCase() === "true" || v?.trim() === "1";

/**
 * Row = one variant. Rows sharing product_sku are grouped into one product
 * (product-level fields taken from the first row seen for that SKU — later
 * rows for the same product only contribute their own variant).
 */
export async function bulkUpsertProducts(rawRows: Record<string, string>[]): Promise<BulkUploadResult> {
  await requireRole("ADMIN");

  const results: BulkUploadRowResult[] = [];
  const grouped = new Map<string, { product: BulkProductRow; variants: BulkProductRow[] }>();

  for (const raw of rawRows) {
    const parsed = BulkProductRowSchema.safeParse(raw);
    if (!parsed.success) {
      results.push({
        productSku: raw.product_sku ?? "?",
        variantSku: raw.variant_sku ?? "?",
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid row.",
      });
      continue;
    }
    const row = parsed.data;
    const existing = grouped.get(row.product_sku);
    if (existing) {
      existing.variants.push(row);
    } else {
      grouped.set(row.product_sku, { product: row, variants: [row] });
    }
  }

  let productsAffected = 0;

  for (const [productSku, { product, variants }] of grouped) {
    const category = await prisma.category.findFirst({
      where: { urlSlug: { equals: product.category, mode: "insensitive" } },
    });
    if (!category) {
      for (const v of variants) {
        results.push({
          productSku,
          variantSku: v.variant_sku,
          status: "error",
          message: `Unknown category "${product.category}".`,
        });
      }
      continue;
    }

    try {
      const existingProduct = await prisma.product.findUnique({ where: { sku: productSku } });

      const productData = {
        name: product.product_name,
        categoryId: category.id,
        shortDescription: product.short_description || null,
        description: product.description,
        materials: product.materials
          ? product.materials.split(";").map((m) => m.trim()).filter(Boolean)
          : [],
        isCustomizable: truthy(product.is_customizable),
        isActive: product.is_active === "" || product.is_active === undefined ? true : truthy(product.is_active),
        isFeatured: truthy(product.is_featured),
        basePriceRetail: product.base_price_retail,
        basePriceWholesale: product.base_price_wholesale,
      };

      const savedProduct = existingProduct
        ? await prisma.product.update({ where: { id: existingProduct.id }, data: productData })
        : await prisma.product.create({
            data: {
              ...productData,
              slug: slugify(product.product_name),
              sku: productSku,
            },
          });

      productsAffected++;

      for (const v of variants) {
        const existingVariant = await prisma.productVariant.findUnique({ where: { sku: v.variant_sku } });
        if (existingVariant && existingVariant.productId !== savedProduct.id) {
          results.push({
            productSku,
            variantSku: v.variant_sku,
            status: "error",
            message: "This variant SKU already belongs to a different product.",
          });
          continue;
        }

        const variantData = {
          color: v.color || null,
          size: v.size || null,
          material: v.material || null,
          priceRetailOverride: v.price_retail_override,
          priceWholesaleOverride: v.price_wholesale_override,
          stockQuantity: v.stock_quantity,
        };

        if (existingVariant) {
          await prisma.productVariant.update({ where: { id: existingVariant.id }, data: variantData });
          results.push({ productSku, variantSku: v.variant_sku, status: "updated" });
        } else {
          await prisma.productVariant.create({
            data: { ...variantData, sku: v.variant_sku, productId: savedProduct.id },
          });
          results.push({ productSku, variantSku: v.variant_sku, status: "created" });
        }
      }
    } catch (error) {
      for (const v of variants) {
        results.push({
          productSku,
          variantSku: v.variant_sku,
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error.",
        });
      }
    }
  }

  revalidatePath("/admin/products");
  return { results, productsAffected };
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
