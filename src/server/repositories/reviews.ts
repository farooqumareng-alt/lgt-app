import "server-only";

import { prisma } from "@/lib/prisma";

export function getApprovedReviewsForProduct(productId: string) {
  return prisma.review.findMany({
    where: { productId, isApproved: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReviewSummary(productId: string) {
  const result = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  return { averageRating: result._avg.rating ?? null, count: result._count };
}

export function getUserReviewForProduct(productId: string, userId: string) {
  return prisma.review.findUnique({ where: { productId_userId: { productId, userId } } });
}

// Homepage "Testimonials" — real, approved reviews only, favoring the most
// substantial ones (a one-line "great!" doesn't read as a testimonial).
// Renders nothing if no review meets the bar yet, rather than padding with
// filler — see the homepage's conditional render around this.
export function getFeaturedReviews(limit = 3) {
  return prisma.review.findMany({
    where: { isApproved: true, rating: { gte: 4 }, body: { not: "" } },
    include: { user: { select: { name: true } }, product: { select: { name: true, slug: true, category: { select: { urlSlug: true } } } } },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

// Verified purchase is computed from real order history at submission time —
// never self-reported — so the badge on a review can be trusted.
export async function hasUserPurchasedProduct(productId: string, userId: string) {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      productVariant: { productId },
      order: { userId, status: { not: "CANCELLED" } },
    },
  });
  return !!orderItem;
}
