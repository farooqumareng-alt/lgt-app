import { cn } from "@/lib/utils";

// Read-only star display — used for the average-rating summary and each
// individual review. Half-stars aren't supported (ratings are whole 1-5
// ints), so this always renders 5 whole/empty stars.
export function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          className={cn("h-4 w-4", star <= Math.round(rating) ? "fill-saddle text-saddle" : "fill-cream-200 text-cream-200")}
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6z" />
        </svg>
      ))}
    </div>
  );
}
