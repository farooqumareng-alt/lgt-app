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

// Saddle-stitching — a real leathercraft detail (two threads locking through
// pre-punched holes along the edge), rendered here as a permanent inset
// dashed line just inside the button's border. Deliberately implemented via
// `outline` rather than `box-shadow` (this file already leans on arbitrary
// box-shadow values for the emboss effect — stacking Tailwind's ring utility,
// which also composites onto box-shadow, on top of those risks one silently
// clobbering the other). `outline` is a separate property, so the permanent
// stitch and the focus-visible override below never fight over the same
// paint: focus-visible switches the same property from a thin dashed line to
// a thicker solid ring, a real accessible indicator, not just decoration.
const STITCH_LIGHT = "outline outline-1 outline-dashed outline-offset-[-6px] outline-[rgba(255,253,250,0.55)]";
const STITCH_DARK = "outline outline-1 outline-dashed outline-offset-[-6px] outline-[rgba(143,101,47,0.45)]";
// One composite arbitrary value, not separate outline/outline-2/outline-dashed
// utilities — tailwind-merge (via cn()) collapses same-modifier outline-*
// utilities into a single "last one wins" group, so `focus-visible:outline
// focus-visible:outline-2` silently dropped the style-reset half and left
// the dashed stitch style bleeding into the focus state. A single shorthand
// value sidesteps that merge entirely.
const FOCUS_RING = "focus-visible:[outline:2px_solid_#5e421f] focus-visible:outline-offset-2";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 rounded-[3px] px-5 py-2.5 text-sm font-medium " +
    "transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-out " +
    `${FOCUS_RING} ` +
    "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        primary:
          `border border-saddle-700 bg-saddle ${LEATHER_GRAIN_LIGHT} ${STITCH_LIGHT} text-cream-50 ` +
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-3px_6px_rgba(0,0,0,0.28),0_1px_2px_rgba(0,0,0,0.18)] " +
          "hover:bg-saddle-600 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-4px_8px_rgba(0,0,0,0.32),0_2px_5px_rgba(0,0,0,0.22)] " +
          "active:translate-y-px active:bg-saddle-700 active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)]",
        secondary:
          `border border-saddle-300 bg-cream-50 ${LEATHER_GRAIN_DARK} ${STITCH_DARK} text-ink ` +
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
