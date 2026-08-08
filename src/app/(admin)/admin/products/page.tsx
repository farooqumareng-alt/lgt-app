import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProductImagePlaceholder } from "@/components/retail/product-image-placeholder";
import { getAllProductsForAdmin } from "@/server/repositories/admin-products";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ q?: string; status?: string; lowStock?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const { q, status, lowStock } = await searchParams;
  const statusFilter = status === "active" || status === "inactive" ? status : undefined;

  const products = await getAllProductsForAdmin({
    search: q?.trim() || undefined,
    status: statusFilter,
    lowStockOnly: lowStock === "1",
  });

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Products</h1>
        <div className="flex gap-2">
          <ButtonLink href="/admin/products/bulk-upload" variant="secondary">
            Bulk Upload
          </ButtonLink>
          <ButtonLink href="/admin/products/new">New Product</ButtonLink>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label className="text-xs text-ink/70">Search</label>
          <Input name="q" defaultValue={q ?? ""} placeholder="Name or SKU" />
        </div>
        <div>
          <label className="text-xs text-ink/70">Status</label>
          <select
            name="status"
            defaultValue={statusFilter ?? ""}
            className="block rounded-sm border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-ink"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-sm">
          <input type="checkbox" name="lowStock" value="1" defaultChecked={lowStock === "1"} />
          Low stock only
        </label>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <div className="mt-8 space-y-3">
        {products.length === 0 && <p className="text-ink/70">No products match.</p>}
        {products.map((product) => (
          <Link key={product.id} href={`/admin/products/${product.id}/edit`}>
            <Card interactive stitched className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm">
                {product.primaryImage ? (
                  <Image
                    src={product.primaryImage.url}
                    alt={product.primaryImage.altText}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <ProductImagePlaceholder className="[&_span]:hidden [&_svg]:h-6 [&_svg]:w-6" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {product.name} <span className="font-normal text-ink/70">({product.sku})</span>
                </p>
                <p className="text-sm text-ink/70">
                  {product.category.name} · {product.variants.length} variant
                  {product.variants.length === 1 ? "" : "s"}
                </p>
                <p className="text-sm text-ink/70">
                  Retail ${Number(product.basePriceRetail).toFixed(2)}
                  {product.basePriceWholesale
                    ? ` · Wholesale $${Number(product.basePriceWholesale).toFixed(2)}`
                    : " · Retail only"}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                {product.isLowStock && <Badge variant="outline">Low stock ({product.totalStock})</Badge>}
                {!product.isActive && <Badge variant="muted">Inactive</Badge>}
                {product.isFeatured && <Badge variant="solid">Featured</Badge>}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
