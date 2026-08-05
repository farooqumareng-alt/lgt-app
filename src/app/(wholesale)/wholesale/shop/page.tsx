import type { Metadata } from "next";

import { requireApprovedWholesaler } from "@/lib/dal";
import { getWholesaleProducts } from "@/server/repositories/wholesale-products";
import { BulkOrderGrid } from "@/components/wholesale/bulk-order-grid";
import { CsvUploadForm } from "@/components/wholesale/csv-upload-form";

export const metadata: Metadata = {
  title: "Wholesale Shop",
  robots: { index: false },
};

export default async function WholesaleShopPage() {
  await requireApprovedWholesaler();
  const products = await getWholesaleProducts();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl">Wholesale Shop</h1>
      <p className="mt-2 text-sm text-ink/70">
        Enter quantities below, or upload a CSV to add many items at once.
      </p>

      <div className="mt-6">
        <CsvUploadForm />
      </div>

      <div className="mt-8">
        {products.length === 0 ? (
          <p className="text-ink/70">No wholesale products available yet.</p>
        ) : (
          <BulkOrderGrid products={products} />
        )}
      </div>
    </div>
  );
}
