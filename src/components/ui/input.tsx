import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        // "Tooled Leather": a faint stamped-groove inset at rest, deepened
        // slightly and ringed with the saddle glow on focus.
        "w-full rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink placeholder:text-ink/70 " +
          "shadow-[inset_0_2px_4px_rgba(43,35,32,0.07)] " +
          "transition-[border-color,box-shadow] duration-150 hover:border-cream-300/80 " +
          "focus-visible:border-saddle focus-visible:shadow-[inset_0_2px_4px_rgba(43,35,32,0.07),0_0_0_3px_rgba(143,101,47,0.15)] focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}
