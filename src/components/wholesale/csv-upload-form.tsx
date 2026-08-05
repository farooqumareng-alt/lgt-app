"use client";

import { useRef, useState, useTransition } from "react";

import { bulkAddToWholesaleCart } from "@/server/actions/wholesale-cart";

function parseCsv(text: string): { sku: string; quantity: number }[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^sku\s*,/i.test(line))
    .map((line) => {
      const [sku, qty] = line.split(",").map((cell) => cell.trim());
      return { sku, quantity: Number(qty) || 0 };
    });
}

export function CsvUploadForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) {
      setMessage("No rows found in the CSV.");
      return;
    }

    startTransition(async () => {
      const result = await bulkAddToWholesaleCart(rows);
      if (result.success) {
        setMessage(`Added ${result.addedCount} item${result.addedCount === 1 ? "" : "s"} to your cart.`);
      } else {
        setMessage(
          result.skippedSkus?.length
            ? `${result.error} Skipped: ${result.skippedSkus.join(", ")}`
            : result.error,
        );
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="rounded-sm border border-cream-200 p-4">
      <p className="text-sm font-medium">Bulk upload via CSV</p>
      <p className="mt-1 text-xs text-ink/70">Two columns, no header required: sku,quantity</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        disabled={isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="mt-3 text-sm"
      />
      {message && <p className="mt-2 text-sm text-saddle-700">{message}</p>}
    </div>
  );
}
