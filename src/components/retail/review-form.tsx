"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarRatingInput } from "@/components/retail/star-rating-input";
import { submitReview } from "@/server/actions/reviews";

export function ReviewForm({ productId }: { productId: string }) {
  const boundAction = submitReview.bind(null, productId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);
  const errors = state && !state.success ? state.errors : undefined;

  if (state?.success) {
    return (
      <p className="text-sm text-ink/70">
        Thanks — your review has been submitted and will appear once it&rsquo;s reviewed.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-medium">Your rating</label>
        <StarRatingInput name="rating" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="review-title">
          Title (optional)
        </label>
        <Input id="review-title" name="title" maxLength={100} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="review-body">
          Review
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          className="w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink focus-visible:border-saddle"
        />
        {errors?.body && <p className="text-sm text-saddle-700">{errors.body[0]}</p>}
      </div>

      {state && !state.success && state.message && <p className="text-sm text-saddle-700">{state.message}</p>}

      <Button type="submit" loading={pending}>
        {pending ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}
