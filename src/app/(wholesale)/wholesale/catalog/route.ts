import { NextResponse } from "next/server";

import { requireApprovedWholesaler } from "@/lib/dal";
import { getWholesaleProducts } from "@/server/repositories/wholesale-products";

// Real, live catalog data as a CSV download — deliberately not a designed
// PDF/marketing asset (no such collateral exists yet, and fabricating one
// would misrepresent the catalog). One row per variant so SKU/price/stock
// are all directly usable for the CSV bulk-order upload on /wholesale/shop.
function escapeCsvField(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function GET() {
  await requireApprovedWholesaler();
  const products = await getWholesaleProducts();

  const header = ["product_name", "sku", "color", "size", "unit_price", "stock_quantity", "price_breaks"];
  const rows = products.flatMap((product) =>
    product.variants.map((variant) => [
      product.name,
      variant.sku,
      variant.color ?? "",
      variant.size ?? "",
      variant.unitPrice.toFixed(2),
      variant.stockQuantity,
      product.priceBreaks.map((pb) => `${pb.minQuantity}+ @ $${pb.price.toFixed(2)}`).join("; "),
    ]),
  );

  const csv = [header, ...rows].map((row) => row.map(escapeCsvField).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wholesale-catalog.csv"',
    },
  });
}
