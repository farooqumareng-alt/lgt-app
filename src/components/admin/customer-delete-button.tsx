"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteCustomerAdmin } from "@/server/actions/admin-customers";

export function CustomerDeleteButton({ userId, name }: { userId: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(`Delete ${name}'s account? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteCustomerAdmin(userId);
      // A successful delete redirects server-side and never returns here.
      if (result && !result.success) setMessage(result.message);
    });
  }

  return (
    <div className="space-y-1">
      <Button type="button" variant="secondary" loading={isPending} onClick={handleDelete}>
        {isPending ? "Deleting…" : "Delete Customer"}
      </Button>
      {message && <p className="text-xs text-saddle-700">{message}</p>}
    </div>
  );
}
