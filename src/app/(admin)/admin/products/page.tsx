import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAllProductsForAdmin } from "@/server/repositories/admin-products";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const { q } = await searchParams;
  const products = await getAllProductsForAdmin(q?.trim() || undefined);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        <ButtonLink href="/admin/products/new">New Product</ButtonLink>
      </div>

      <form className="mt-6 flex items-end gap-3" method="get">
        <div>
          <label className="text-xs text-ink/60">Search</label>
          <Input name="q" defaultValue={q ?? ""} placeholder="Name or SKU" />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="mt-8 space-y-3">
        {products.length === 0 && <p className="text-ink/60">No products match.</p>}
        {products.map((product) => (
          <Link key={product.id} href={`/admin/products/${product.id}/edit`}>
            <Card className="flex items-center justify-between p-4 hover:border-saddle">
              <div>
                <p className="font-medium">
                  {product.name} <span className="text-ink/50">({product.sku})</span>
                </p>
                <p className="text-sm text-ink/60">
                  {product.category.name} · {product.variants.length} variant
                  {product.variants.length === 1 ? "" : "s"} · Retail $
                  {Number(product.basePriceRetail).toFixed(2)}
                  {product.basePriceWholesale
                    ? ` · Wholesale $${Number(product.basePriceWholesale).toFixed(2)}`
                    : " · Retail only"}
                </p>
              </div>
              <div className="flex gap-2">
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
