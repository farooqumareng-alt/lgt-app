import "server-only";

import { prisma } from "@/lib/prisma";

const LOW_STOCK_THRESHOLD = 5;

export async function getAllProductsForAdmin(search?: string) {
  const products = await prisma.product.findMany({
    where: search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }] }
      : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      variants: { select: { id: true, stockQuantity: true } },
    },
  });

  return products.map((product) => {
    const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
    return { ...product, totalStock, isLowStock: totalStock < LOW_STOCK_THRESHOLD };
  });
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
