import "server-only";

import { prisma } from "@/lib/prisma";

/** Products enabled for wholesale, with their resolved base price + price breaks for display. */
export async function getWholesaleProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true, basePriceWholesale: { not: null } },
    orderBy: { name: "asc" },
    include: {
      category: { select: { urlSlug: true } },
      images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
      variants: { where: { isActive: true } },
      priceBreaks: { orderBy: { minQuantity: "asc" } },
    },
  });

  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    basePriceWholesale: Number(product.basePriceWholesale),
    categoryUrlSlug: product.category.urlSlug,
    image: product.images[0] ?? null,
    priceBreaks: product.priceBreaks.map((pb) => ({
      minQuantity: pb.minQuantity,
      price: Number(pb.price),
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      stockQuantity: variant.stockQuantity,
      unitPrice: Number(variant.priceWholesaleOverride ?? product.basePriceWholesale),
    })),
  }));
}

export function getWholesaleVariantBySku(sku: string) {
  return prisma.productVariant.findFirst({
    where: { sku, isActive: true, product: { isActive: true, basePriceWholesale: { not: null } } },
    include: { product: true },
  });
}
