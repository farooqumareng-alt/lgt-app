import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus-visible:border-saddle",
        className,
      )}
      {...props}
    />
  );
}
