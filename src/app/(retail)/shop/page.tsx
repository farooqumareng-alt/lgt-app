import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/retail/breadcrumbs";
import { ProductCard } from "@/components/retail/product-card";
import { FilterChip } from "@/components/ui/filter-chip";
import { getActiveCategories, getActiveProducts } from "@/server/repositories/products";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Shop All Leather Goods",
  description:
    "Browse genuine leather belts, wallets, keychains, purses, and handbags.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getActiveProducts(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }]} />

      <h1 className="mt-4 font-display text-3xl">Shop All</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip href="/shop" active>
          All
        </FilterChip>
        {categories.map((category) => (
          <FilterChip key={category.id} href={`/shop/${category.urlSlug}`}>
            {category.name}
          </FilterChip>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} {...product} />
        ))}
      </div>
    </div>
  );
}
