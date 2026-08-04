"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = React.ComponentProps<typeof Button> & {
  pendingLabel: string;
};

/**
 * For plain `<form action={serverAction}>` submissions with no client-side
 * useActionState/useTransition already tracking pending state — reads it
 * directly off the nearest parent form via useFormStatus instead.
 */
export function SubmitButton({ pendingLabel, children, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
