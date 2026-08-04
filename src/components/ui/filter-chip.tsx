import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

// Same saddle-stitch detail as Button/Card (see button.tsx for why this is
// `outline`, not `box-shadow`) — sized down for a chip's smaller padding.
const STITCH_ACTIVE = "outline outline-1 outline-dashed outline-offset-[-4px] outline-[rgba(255,253,250,0.55)]";
const STITCH_INACTIVE = "outline outline-1 outline-dashed outline-offset-[-4px] outline-[rgba(143,101,47,0.35)]";

type FilterChipProps = ComponentProps<typeof Link> & {
  active?: boolean;
};

/** A filter/category pill — used for shop category chips, admin status filters, etc. */
export function FilterChip({ active, className, ...props }: FilterChipProps) {
  return (
    <Link
      className={cn(
        "rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors duration-150",
        active
          ? `border-saddle bg-saddle text-cream-50 ${STITCH_ACTIVE}`
          : `border-cream-300 hover:border-saddle ${STITCH_INACTIVE}`,
        className,
      )}
      {...props}
    />
  );
}
