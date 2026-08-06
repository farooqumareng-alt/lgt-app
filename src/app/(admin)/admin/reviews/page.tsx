import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { StarRating } from "@/components/retail/star-rating";
import { approveReview, rejectReview } from "@/server/actions/admin-reviews";
import { getAllReviewsForAdmin } from "@/server/repositories/admin-reviews";

export const metadata: Metadata = {
  title: "Reviews",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ filter?: string }> };

const FILTERS = ["pending", "approved", "all"] as const;
type Filter = (typeof FILTERS)[number];

export default async function AdminReviewsPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const { filter: rawFilter } = await searchParams;
  const filter: Filter = FILTERS.includes(rawFilter as Filter) ? (rawFilter as Filter) : "pending";

  const reviews = await getAllReviewsForAdmin(filter);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl">Reviews</h1>

      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/reviews?filter=${f}`}
            className={`rounded-sm px-3 py-1.5 text-sm font-medium capitalize ${
              filter === f ? "bg-saddle text-cream-50" : "bg-cream-200 text-ink/70 hover:bg-cream-300"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {reviews.length === 0 && <p className="text-ink/70">No {filter === "all" ? "" : filter} reviews.</p>}
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  {review.isVerifiedPurchase && <Badge variant="muted">Verified Purchase</Badge>}
                  {review.isApproved && <Badge variant="outline">Approved</Badge>}
                </div>
                <p className="mt-2 text-sm text-ink/70">
                  {review.product.name} — {review.user.name ?? review.user.email}
                </p>
                {review.title && <p className="mt-2 font-medium">{review.title}</p>}
                <p className="mt-1 text-sm text-ink/80">{review.body}</p>
                <p className="mt-2 text-xs text-ink/50">
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {!review.isApproved && (
                  <form action={approveReview.bind(null, review.id)}>
                    <SubmitButton pendingLabel="Approving…">Approve</SubmitButton>
                  </form>
                )}
                <form action={rejectReview.bind(null, review.id)}>
                  <SubmitButton pendingLabel="Rejecting…" variant="secondary">
                    Reject
                  </SubmitButton>
                </form>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
