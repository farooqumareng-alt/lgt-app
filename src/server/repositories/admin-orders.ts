import "server-only";

import type { OrderChannel, OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export function getAllOrdersForAdmin(filters: { status?: OrderStatus; channel?: OrderChannel; search?: string }) {
  const { status, channel, search } = filters;

  return prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(channel ? { channel } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: "insensitive" } },
              { guestEmail: { contains: search, mode: "insensitive" } },
              { user: { email: { contains: search, mode: "insensitive" } } },
              { user: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { items: true, user: { select: { name: true, email: true } } },
    take: 100,
  });
}

export function getOrderForAdmin(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      user: { select: { name: true, email: true } },
    },
  });
}
