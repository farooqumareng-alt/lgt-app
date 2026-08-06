"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

async function revalidateReviewProduct(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { product: { select: { slug: true, category: { select: { urlSlug: true } } } } },
  });
  if (review) revalidatePath(`/shop/${review.product.category.urlSlug}/${review.product.slug}`);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function approveReview(reviewId: string) {
  await requireRole("ADMIN");
  await revalidateReviewProduct(reviewId);
  await prisma.review.update({ where: { id: reviewId }, data: { isApproved: true } });
  revalidatePath("/admin/reviews");
}

// Rejected reviews are hard-deleted, not just hidden — nothing else
// references a Review row (order data never snapshots it), so there's no FK
// exposure to worry about, and keeping spam/abuse text around serves no
// purpose once an admin has judged it.
export async function rejectReview(reviewId: string) {
  await requireRole("ADMIN");
  await revalidateReviewProduct(reviewId);
  await prisma.review.delete({ where: { id: reviewId } });
  revalidatePath("/admin/reviews");
}
