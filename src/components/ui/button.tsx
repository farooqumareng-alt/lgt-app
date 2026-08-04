import { type VariantProps, cva } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

// "Tooled Leather" — buttons read as stamped/embossed material rather than
// floating UI chrome: a fine diagonal grain, a raised top highlight + a
// deeper inset shadow along the bottom edge, and on press the emboss
// inverts (like the surface compressing) instead of the button lifting.
const LEATHER_GRAIN_LIGHT =
  "bg-[image:repeating-linear-gradient(115deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_3px)]";
const LEATHER_GRAIN_DARK =
  "bg-[image:repeating-linear-gradient(115deg,rgba(43,35,32,0.03)_0px,rgba(43,35,32,0.03)_1px,transparent_1px,transparent_3px)]";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 rounded-[3px] px-5 py-2.5 text-sm font-medium " +
    "transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-out " +
    "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        primary:
          `border border-saddle-700 bg-saddle ${LEATHER_GRAIN_LIGHT} text-cream-50 ` +
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-3px_6px_rgba(0,0,0,0.28),0_1px_2px_rgba(0,0,0,0.18)] " +
          "hover:bg-saddle-600 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-4px_8px_rgba(0,0,0,0.32),0_2px_5px_rgba(0,0,0,0.22)] " +
          "active:translate-y-px active:bg-saddle-700 active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)]",
        secondary:
          `border border-saddle-300 bg-cream-50 ${LEATHER_GRAIN_DARK} text-ink ` +
          "shadow-[inset_0_1px_2px_rgba(43,35,32,0.07)] " +
          "hover:border-saddle hover:text-saddle-700 " +
          "active:translate-y-px active:shadow-[inset_0_2px_4px_rgba(43,35,32,0.14)]",
        ghost: "text-ink hover:bg-cream-200 active:bg-cream-300",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
      />
    </svg>
  );
}

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner and disables the button — for a submit mid-flight via useActionState/useTransition. */
    loading?: boolean;
  };

export function Button({ className, variant, loading, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

export function ButtonLink({ className, variant, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant }), className)} {...props} />;
}
