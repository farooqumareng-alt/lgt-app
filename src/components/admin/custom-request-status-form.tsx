"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateCustomRequestStatus } from "@/server/actions/admin-custom-requests";
import type { CustomRequestStatus } from "@/generated/prisma/enums";

const STATUSES: CustomRequestStatus[] = ["NEW", "IN_REVIEW", "QUOTED", "APPROVED", "COMPLETED", "DECLINED"];

export function CustomRequestStatusForm({ id, currentStatus }: { id: string; currentStatus: CustomRequestStatus }) {
  const [status, setStatus] = useState<CustomRequestStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    startTransition(async () => {
      await updateCustomRequestStatus(id, status, note || undefined);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as CustomRequestStatus)}
        className="rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ")}
          </option>
        ))}
      </select>
      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="max-w-xs" />
      <Button type="button" onClick={submit} loading={isPending} variant="secondary">
        {isPending ? "Saving…" : "Update Status"}
      </Button>
    </div>
  );
}
