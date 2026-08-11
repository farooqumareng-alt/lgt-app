import "server-only";

import { prisma } from "@/lib/prisma";

export function getAllCategoriesForAdmin() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export function getCategoryForEdit(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export function getCategoryProductCount(id: string) {
  return prisma.product.count({ where: { categoryId: id } });
}
