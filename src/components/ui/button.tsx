import { type VariantProps, cva } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium " +
    "transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] " +
    "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        primary:
          "bg-saddle text-cream-50 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_20px_-8px_rgba(143,101,47,0.55)] " +
          "hover:-translate-y-0.5 hover:bg-saddle-600 hover:shadow-[0_2px_4px_rgba(0,0,0,0.14),0_14px_28px_-10px_rgba(143,101,47,0.65)] " +
          "active:translate-y-0 active:bg-saddle-700 active:shadow-[0_1px_2px_rgba(0,0,0,0.16)]",
        secondary:
          "border border-cream-300 bg-cream-50 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)] " +
          "hover:-translate-y-0.5 hover:border-saddle hover:text-saddle-700 " +
          "active:translate-y-0",
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
