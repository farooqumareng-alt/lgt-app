import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/retail/breadcrumbs";
import { ProductCard } from "@/components/retail/product-card";
import { JsonLd, breadcrumbListJsonLd } from "@/lib/seo/json-ld";
import {
  getActiveCategories,
  getCategoryByUrlSlug,
  getProductsByCategoryId,
} from "@/server/repositories/products";

export const revalidate = 3600;

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: urlSlug } = await params;
  const category = await getCategoryByUrlSlug(urlSlug);
  if (!category) return {};

  const title = category.metaTitle ?? `Genuine Leather ${category.name}`;
  const description =
    category.metaDescription ??
    `Shop genuine leather ${category.name.toLowerCase()} — handcrafted, built to last.`;

  return {
    title,
    description,
    alternates: { canonical: `/shop/${category.urlSlug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: urlSlug } = await params;
  const [category, allCategories] = await Promise.all([
    getCategoryByUrlSlug(urlSlug),
    getActiveCategories(),
  ]);

  if (!category) notFound();

  const products = await getProductsByCategoryId(category.id);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: category.name, href: `/shop/${category.urlSlug}` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <JsonLd data={breadcrumbListJsonLd(breadcrumbItems)} />
      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="mt-4 font-display text-3xl">{category.name}</h1>
      {category.description && (
        <p className="mt-2 max-w-2xl text-ink/70">{category.description}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className="rounded-sm border border-cream-300 px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:border-saddle"
        >
          All
        </Link>
        {allCategories.map((c) => (
          <Link
            key={c.id}
            href={`/shop/${c.urlSlug}`}
            className={
              c.id === category.id
                ? "rounded-sm border border-saddle bg-saddle-50 px-3 py-1.5 text-sm font-medium"
                : "rounded-sm border border-cream-300 px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:border-saddle"
            }
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-ink/60">No products in this category yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}
