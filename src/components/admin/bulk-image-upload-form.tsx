"use client";

import { useRef, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { bulkUploadProductImages, type BulkImageResult } from "@/server/actions/admin-bulk-images";

export function BulkImageUploadForm() {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<BulkImageResult[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList) {
    setResults(null);
    const formData = new FormData();
    for (const file of Array.from(files)) formData.append("images", file);

    startTransition(async () => {
      const outcome = await bulkUploadProductImages(formData);
      setResults(outcome.results);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  const uploadedCount = results?.filter((r) => r.status === "uploaded").length ?? 0;

  return (
    <div className="rounded-sm border border-cream-200 p-5">
      <p className="text-sm font-medium">Bulk image upload</p>
      <p className="mt-1 text-xs text-ink/70">
        Select many images at once. Each file is matched to a product by its filename starting with that
        product&apos;s SKU — e.g. <code>BLT-001-front.jpg</code> or <code>BLT-001.jpg</code> both match SKU{" "}
        <code>BLT-001</code>. The first matched image per product becomes its primary photo.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={isPending}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
        }}
        className="mt-3 text-sm"
      />
      {isPending && <p className="mt-2 text-sm text-ink/70">Uploading…</p>}

      {results && (
        <div className="mt-4">
          <p className="text-sm font-medium">
            {uploadedCount} of {results.length} image{results.length === 1 ? "" : "s"} uploaded
          </p>
          <div className="mt-2 max-h-64 space-y-1 overflow-y-auto text-xs">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <Badge
                  variant={r.status === "uploaded" ? "solid" : "outline"}
                  className={r.status !== "uploaded" ? "border-saddle-700 text-saddle-700" : ""}
                >
                  {r.status}
                </Badge>
                <span className="text-ink/70">
                  {r.fileName}
                  {r.matchedSku && ` → ${r.matchedSku}`}
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
