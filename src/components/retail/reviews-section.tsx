import Link from "next/link";

import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { ReviewForm } from "@/components/retail/review-form";
import { StarRating } from "@/components/retail/star-rating";
import { getApprovedReviewsForProduct, getReviewSummary, getUserReviewForProduct } from "@/server/repositories/reviews";

export async function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, summary, session] = await Promise.all([
    getApprovedReviewsForProduct(productId),
    getReviewSummary(productId),
    auth(),
  ]);

  const existingReview = session?.user ? await getUserReviewForProduct(productId, session.user.id) : null;

  return (
    <section id="reviews" className="mt-16 scroll-mt-20 border-t border-cream-200 pt-10">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-2xl">Reviews</h2>
        {summary.count > 0 && summary.averageRating !== null && (
          <>
            <StarRating rating={summary.averageRating} />
            <span className="text-sm text-ink/70">
              {summary.averageRating.toFixed(1)} ({summary.count} review{summary.count === 1 ? "" : "s"})
            </span>
          </>
        )}
      </div>

      {reviews.length === 0 && <p className="mt-4 text-sm text-ink/70">No reviews yet — be the first.</p>}

      <div className="mt-6 space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-cream-200 pb-6 last:border-0">
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} />
              {review.isVerifiedPurchase && <Badge variant="muted">Verified Purchase</Badge>}
            </div>
            {review.title && <p className="mt-2 font-medium">{review.title}</p>}
            <p className="mt-1 text-sm leading-relaxed text-ink/70">{review.body}</p>
            <p className="mt-2 text-xs text-ink/50">
              {review.user.name ?? "Anonymous"} ·{" "}
              {new Date(review.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-cream-200 pt-8">
        <h3 className="font-medium">Write a Review</h3>
        <div className="mt-3">
          {!session?.user ? (
            <p className="text-sm text-ink/70">
              <Link href="/login" className="text-saddle hover:underline">
                Sign in
              </Link>{" "}
              to write a review.
            </p>
          ) : existingReview ? (
            <p className="text-sm text-ink/70">You&rsquo;ve already reviewed this product — thank you.</p>
          ) : (
            <ReviewForm productId={productId} />
          )}
        </div>
      </div>
    </section>
  );
}
