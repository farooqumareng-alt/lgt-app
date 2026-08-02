import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllProductsForAdmin } from "@/server/repositories/admin-products";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false },
};

export default async function AdminProductsPage() {
  await requireRole("ADMIN");
  const products = await getAllProductsForAdmin();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        <ButtonLink href="/admin/products/new">New Product</ButtonLink>
      </div>

      <div className="mt-8 space-y-3">
        {products.length === 0 && <p className="text-ink/60">No products yet.</p>}
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
