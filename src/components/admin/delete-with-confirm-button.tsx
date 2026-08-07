"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

// Small shared helper for any admin "delete this record" button that needs a
// confirm() prompt before firing — used by Custom Requests and Contact
// Messages, both real hard-deletes with no FK exposure to protect against.
export function DeleteWithConfirmButton({
  action,
  confirmMessage,
  label = "Delete",
  pendingLabel = "Deleting…",
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
  pendingLabel?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(action);
  }

  return (
    <Button type="button" variant="secondary" loading={isPending} onClick={handleClick}>
      {isPending ? pendingLabel : label}
    </Button>
  );
}
