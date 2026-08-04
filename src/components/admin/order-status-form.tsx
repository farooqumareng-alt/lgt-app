"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateOrderStatus } from "@/server/actions/admin-orders";
import type { OrderStatus } from "@/generated/prisma/enums";

const STATUSES: OrderStatus[] = ["INVOICED", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  function submit() {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status, note || undefined);
      setMessage(result.success ? "Status updated." : result.message);
      setNote("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="max-w-xs"
        />
        <Button type="button" onClick={submit} loading={isPending} variant="secondary">
          {isPending ? "Updating…" : "Update Status"}
        </Button>
      </div>
      {message && <p className="text-sm text-ink/60">{message}</p>}
    </div>
  );
}
