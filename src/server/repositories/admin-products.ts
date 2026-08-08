import "server-only";

import { prisma } from "@/lib/prisma";

export const LOW_STOCK_THRESHOLD = 5;

export type AdminProductFilter = {
  search?: string;
  status?: "active" | "inactive";
  lowStockOnly?: boolean;
};

export async function getAllProductsForAdmin(filter: AdminProductFilter = {}) {
  const { search, status, lowStockOnly } = filter;

  const products = await prisma.product.findMany({
    where: {
      ...(search
        ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }] }
        : {}),
      ...(status ? { isActive: status === "active" } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      variants: { select: { id: true, stockQuantity: true } },
      // One thumbnail is enough for a list row — the edit page's own
      // Images section is where the full gallery lives.
      images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
    },
  });

  const withStock = products.map((product) => {
    const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
    return { ...product, totalStock, isLowStock: totalStock < LOW_STOCK_THRESHOLD, primaryImage: product.images[0] ?? null };
  });

  return lowStockOnly ? withStock.filter((p) => p.isLowStock) : withStock;
}

export function getProductForEdit(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { sku: "asc" } },
      priceBreaks: { orderBy: { minQuantity: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export function getAllCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}
