import "server-only";

import { prisma } from "@/lib/prisma";

export function getAllReviewsForAdmin(filter: "pending" | "approved" | "all" = "pending") {
  return prisma.review.findMany({
    where: filter === "all" ? undefined : { isApproved: filter === "approved" },
    include: { user: { select: { name: true, email: true } }, product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
}
