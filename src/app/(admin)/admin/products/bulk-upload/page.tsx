import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { BulkImageUploadForm } from "@/components/admin/bulk-image-upload-form";
import { BulkProductUploadForm } from "@/components/admin/bulk-product-upload-form";
import { BULK_PRODUCT_CSV_COLUMNS } from "@/lib/validation/admin-bulk-products";

export const metadata: Metadata = {
  title: "Bulk Upload",
  robots: { index: false },
};

const TEMPLATE_ROWS = [
  BULK_PRODUCT_CSV_COLUMNS.join(","),
  [
    "BLT-100",
    "Ranch Hand Belt",
    "belts",
    "Full-grain leather work belt",
    "A rugged everyday belt built from full-grain leather.",
    "Full-grain leather;Brass buckle",
    "72.00",
    "24.00",
    "false",
    "true",
    "false",
    "BLT-100-BRN-32",
    "Brown",
    "32",
    "",
    "",
    "",
    "15",
  ].join(","),
  [
    "BLT-100",
    "Ranch Hand Belt",
    "belts",
    "Full-grain leather work belt",
    "A rugged everyday belt built from full-grain leather.",
    "Full-grain leather;Brass buckle",
    "72.00",
    "24.00",
    "false",
    "true",
    "false",
    "BLT-100-BRN-34",
    "Brown",
    "34",
    "",
    "",
    "",
    "10",
  ].join(","),
].join("\n");

const TEMPLATE_HREF = `data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE_ROWS)}`;

export default async function BulkUploadPage() {
  await requireRole("ADMIN");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/admin/products" className="text-sm text-saddle hover:underline">
        ← Products
      </Link>
      <h1 className="mt-2 font-display text-3xl">Bulk Upload</h1>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="font-medium">1. Products &amp; Variants</p>
          <a href={TEMPLATE_HREF} download="products-template.csv" className="text-xs font-medium text-saddle hover:underline">
            Download CSV template
          </a>
        </div>
        <div className="mt-3">
          <BulkProductUploadForm />
        </div>
      </div>

      <div className="mt-10">
        <p className="font-medium">2. Images</p>
        <p className="mt-1 text-xs text-ink/70">Upload products first — images match against existing product SKUs.</p>
        <div className="mt-3">
          <BulkImageUploadForm />
        </div>
      </div>
    </div>
  );
}
