import "server-only";

import { prisma } from "@/lib/prisma";

export function getAllProductsForAdmin() {
  return prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      variants: { select: { id: true } },
    },
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
