"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { refundOrder } from "@/server/actions/admin-orders";

const REASONS = [
  { value: "", label: "No reason given" },
  { value: "requested_by_customer", label: "Requested by customer" },
  { value: "duplicate", label: "Duplicate order" },
  { value: "fraudulent", label: "Fraudulent" },
];

export function RefundForm({ orderId, remaining }: { orderId: string; remaining: number }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  function submit() {
    const amountLabel = amount.trim() ? `$${amount}` : `the full remaining $${remaining.toFixed(2)}`;
    // Real money moves here and it can't be undone from this UI — a
    // deliberate extra confirmation, unlike the status/tracking forms above.
    if (!window.confirm(`Issue a refund of ${amountLabel} for this order? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await refundOrder(orderId, amount || undefined, reason || undefined);
      setMessage(result.success ? "Refund issued." : result.message);
      if (result.success) {
        setAmount("");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          step="0.01"
          min="0"
          max={remaining}
          placeholder={`Full refund ($${remaining.toFixed(2)})`}
          className="max-w-[220px]"
        />
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink"
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <Button type="button" onClick={submit} loading={isPending} variant="secondary">
          {isPending ? "Processing…" : "Issue Refund"}
        </Button>
      </div>
      {message && <p className="text-sm text-ink/70">{message}</p>}
    </div>
  );
}
