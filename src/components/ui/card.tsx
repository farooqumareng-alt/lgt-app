import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-sm border border-cream-200 bg-cream-50",
        className,
      )}
      {...props}
    />
  );
}
