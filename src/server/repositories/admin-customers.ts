import "server-only";

import { prisma } from "@/lib/prisma";
import { getOrdersForUser } from "@/server/repositories/orders";

export async function getAllCustomersForAdmin(search?: string) {
  const users = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const userIds = users.map((u) => u.id);
  const orderStats = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds } },
    _count: { _all: true },
    _sum: { grandTotal: true },
    _max: { createdAt: true },
  });
  const statsByUserId = new Map(orderStats.map((s) => [s.userId, s]));

  return users.map((user) => {
    const stats = statsByUserId.get(user.id);
    return {
      ...user,
      orderCount: stats?._count._all ?? 0,
      lifetimeSpend: stats?._sum.grandTotal ? Number(stats._sum.grandTotal) : 0,
      lastOrderAt: stats?._max.createdAt ?? null,
    };
  });
}

export function getCustomerDetail(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true, role: true },
  });
}

export function getCustomerOrders(userId: string) {
  return getOrdersForUser(userId);
}
