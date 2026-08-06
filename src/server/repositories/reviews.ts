import "server-only";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { prisma } from "@/lib/prisma";

/**
 * Every function below is reachable from the homepage or every PDP, both of
 * which get a build-time trial render even though they end up dynamic —
 * confirmed directly: a missing Review table failed the actual Vercel build
 * ("Error occurred prerendering page /") the same way ContentPage did before
 * it got this same defensive-catch treatment. Never trust the migration is
 * applied by the time this runs; degrade gracefully instead.
 */

export async function getApprovedReviewsForProduct(productId: string) {
  try {
    return await prisma.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2021") return [];
    throw error;
  }
}

export async function getReviewSummary(productId: string) {
  try {
    const result = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });
    return { averageRating: result._avg.rating ?? null, count: result._count };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2021") {
      return { averageRating: null, count: 0 };
    }
    throw error;
  }
}

export async function getUserReviewForProduct(productId: string, userId: string) {
  try {
    return await prisma.review.findUnique({ where: { productId_userId: { productId, userId } } });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2021") return null;
    throw error;
  }
}

// Homepage "Testimonials" — real, approved reviews only, favoring the most
// substantial ones (a one-line "great!" doesn't read as a testimonial).
// Renders nothing if no review meets the bar yet, rather than padding with
// filler — see the homepage's conditional render around this.
export async function getFeaturedReviews(limit = 3) {
  try {
    return await prisma.review.findMany({
      where: { isApproved: true, rating: { gte: 4 }, body: { not: "" } },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, slug: true, category: { select: { urlSlug: true } } } },
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2021") return [];
    throw error;
  }
}

// Verified purchase is computed from real order history at submission time —
// never self-reported — so the badge on a review can be trusted. Only
// reachable via the submitReview action (a real form POST, never a build-time
// render), so no defensive catch needed here — if the Review table is
// missing at this point, submission should fail loudly, not pretend to work.
export async function hasUserPurchasedProduct(productId: string, userId: string) {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      productVariant: { productId },
      order: { userId, status: { not: "CANCELLED" } },
    },
  });
  return !!orderItem;
}
