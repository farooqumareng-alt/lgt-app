"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

// Clickable 1-5 star picker. A native <select> would be more accessible by
// default, but a star click target is the expected pattern for review forms
// and the pressed rating is still exposed via a real hidden radio group, so
// keyboard/screen-reader users can pick a rating without relying on hover.
export function StarRatingInput({ name, defaultValue = 0 }: { name: string; defaultValue?: number }) {
  const [rating, setRating] = useState(defaultValue);
  const [hovered, setHovered] = useState(0);
  const displayRating = hovered || rating;

  return (
    <div role="radiogroup" aria-label="Rating" className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <label key={star} className="cursor-pointer" onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}>
          <input
            type="radio"
            name={name}
            value={star}
            checked={rating === star}
            onChange={() => setRating(star)}
            className="sr-only"
            required
          />
          <svg
            viewBox="0 0 20 20"
            className={cn("h-7 w-7 transition-colors", star <= displayRating ? "fill-saddle text-saddle" : "fill-cream-200 text-cream-200")}
            aria-hidden="true"
          >
            <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6z" />
          </svg>
        </label>
      ))}
    </div>
  );
}
