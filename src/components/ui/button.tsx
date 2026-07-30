import { type VariantProps, cva } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-sm px-5 py-2.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-saddle text-cream-50 hover:bg-saddle-600 active:bg-saddle-700",
        secondary:
          "border border-saddle bg-transparent text-ink hover:bg-saddle-50",
        ghost: "text-ink hover:bg-cream-200",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant }), className)} {...props} />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

export function ButtonLink({ className, variant, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant }), className)} {...props} />;
}
