import "server-only";

import type { CustomRequestStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export function getAllCustomRequestsForAdmin(status?: CustomRequestStatus) {
  return prisma.customRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, slug: true } },
      _count: { select: { images: true } },
    },
  });
}

export function getCustomRequestForAdmin(id: string) {
  return prisma.customRequest.findUnique({
    where: { id },
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export function countNewCustomRequests() {
  return prisma.customRequest.count({ where: { status: "NEW" } });
}
