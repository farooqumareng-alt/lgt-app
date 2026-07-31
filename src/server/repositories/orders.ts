import "server-only";

import { prisma } from "@/lib/prisma";

export function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export function getRecentOrdersForUser(userId: string, limit = 3) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { items: true },
  });
}

/** Ownership-checked — returns null if the order doesn't exist or belongs to someone else. */
export async function getOrderDetail(userId: string, orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order || order.userId !== userId) return null;
  return order;
}
