"use client";

import { useRef, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { parseCsvWithHeader } from "@/lib/csv";
import { bulkUpsertProducts, type BulkUploadRowResult } from "@/server/actions/admin-bulk-products";

export function BulkProductUploadForm() {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<BulkUploadRowResult[] | null>(null);
  const [productsAffected, setProductsAffected] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setParseError(null);
    setResults(null);
    const text = await file.text();
    const rows = parseCsvWithHeader(text);
    if (rows.length === 0) {
      setParseError("No data rows found — check the file has a header row plus at least one product row.");
      return;
    }

    startTransition(async () => {
      const outcome = await bulkUpsertProducts(rows);
      setResults(outcome.results);
      setProductsAffected(outcome.productsAffected);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  const errorCount = results?.filter((r) => r.status === "error").length ?? 0;

  return (
    <div className="rounded-sm border border-cream-200 p-5">
      <p className="text-sm font-medium">Bulk product + variant upload</p>
      <p className="mt-1 text-xs text-ink/70">
        CSV with a header row — one row per variant, group rows under the same product_sku to add multiple
        variants to one product. Existing product/variant SKUs are updated in place; new SKUs are created.
      </p>
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
      {isPending && <p className="mt-2 text-sm text-ink/70">Processing…</p>}
      {parseError && <p className="mt-2 text-sm text-saddle-700">{parseError}</p>}

      {results && (
        <div className="mt-4">
          <p className="text-sm font-medium">
            {productsAffected} product{productsAffected === 1 ? "" : "s"} affected
            {errorCount > 0 && ` · ${errorCount} row error${errorCount === 1 ? "" : "s"}`}
          </p>
          <div className="mt-2 max-h-64 space-y-1 overflow-y-auto text-xs">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <Badge
                  variant={r.status === "error" ? "outline" : r.status === "created" ? "solid" : "muted"}
                  className={r.status === "error" ? "border-saddle-700 text-saddle-700" : ""}
                >
                  {r.status}
                </Badge>
                <span className="text-ink/70">
                  {r.productSku} / {r.variantSku}
                  {r.message && ` — ${r.message}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
