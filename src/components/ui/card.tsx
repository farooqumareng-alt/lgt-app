import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type CardProps = ComponentProps<"div"> & {
  /** For cards that are themselves a click target (wrapped in a Link/button) — adds a lift + shadow on hover. */
  interactive?: boolean;
};

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-sm border border-cream-200 bg-cream-50",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:border-saddle hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.25)]",
        className,
      )}
      {...props}
    />
  );
}
