import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

// Same saddle-stitch detail as Button (see button.tsx for why this is
// `outline`, not `box-shadow`) — a thin inset dashed line just inside the
// card's real border. Opt-in via `stitched`, not the Card default: it reads
// right on retail marketing surfaces (product cards, category tiles) but
// would just add noise to dense admin/account list rows.
const STITCH = "outline outline-1 outline-dashed outline-offset-[-5px] outline-[rgba(143,101,47,0.4)]";

type CardProps = ComponentProps<"div"> & {
  /**
   * For cards that are themselves a click target (wrapped in a Link/button).
   * "Tooled Leather": the card reads as stamped material, not floating UI —
   * hover deepens the edge (border + a raised top highlight) rather than
   * lifting the whole card off the page.
   */
  interactive?: boolean;
  /** Adds the permanent saddle-stitch inset border — see STITCH above. */
  stitched?: boolean;
};

export function Card({ className, interactive, stitched, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-sm border border-cream-200 bg-cream-50",
        stitched && STITCH,
        interactive &&
          "transition-[box-shadow,border-color] duration-150 ease-out hover:border-saddle " +
            "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_-16px_rgba(43,35,32,0.4)]",
        className,
      )}
      {...props}
    />
  );
}
