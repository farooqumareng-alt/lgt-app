"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setTracking } from "@/server/actions/admin-orders";
import { CARRIERS } from "@/lib/shipping";

export function OrderTrackingForm({
  orderId,
  currentCarrier,
  currentTrackingNumber,
}: {
  orderId: string;
  currentCarrier: string | null;
  currentTrackingNumber: string | null;
}) {
  const [carrier, setCarrier] = useState(currentCarrier ?? CARRIERS[0]);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  function submit() {
    startTransition(async () => {
      const result = await setTracking(orderId, carrier, trackingNumber);
      setMessage(result.success ? "Tracking saved." : result.message);
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          className="rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink"
        >
          {CARRIERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Input
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Tracking number"
          className="max-w-xs"
        />
        <Button type="button" onClick={submit} loading={isPending} variant="secondary">
          {isPending ? "Saving…" : "Save Tracking"}
        </Button>
      </div>
      {message && <p className="text-sm text-ink/60">{message}</p>}
    </div>
  );
}
