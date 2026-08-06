"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewSchema } from "@/lib/validation/reviews";
import { hasUserPurchasedProduct } from "@/server/repositories/reviews";

export type ReviewActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

// Bound to a form on the public PDP — a logged-out visitor just sees a
// friendly "sign in to review" message rather than the whole page redirecting
// to /login, so browsing/buying stays uninterrupted for guests.
export async function submitReview(
  productId: string,
  _prevState: ReviewActionResult | undefined,
  formData: FormData,
): Promise<ReviewActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Sign in to write a review." };
  }

  const parsed = ReviewSchema.safeParse({
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId: session.user.id } },
  });
  if (existing) {
    return { success: false, message: "You've already reviewed this product." };
  }

  const isVerifiedPurchase = await hasUserPurchasedProduct(productId, session.user.id);

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true, category: { select: { urlSlug: true } } } });
  if (!product) {
    return { success: false, message: "This product no longer exists." };
  }

  await prisma.review.create({
    data: {
      productId,
      userId: session.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
      isVerifiedPurchase,
      isApproved: false,
    },
  });

  revalidatePath(`/shop/${product.category.urlSlug}/${product.slug}`);
  return { success: true };
}
