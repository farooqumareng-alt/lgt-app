import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/retail/breadcrumbs";
import { ProductCard } from "@/components/retail/product-card";
import { ButtonLink } from "@/components/ui/button";
import { getCustomizableProducts } from "@/server/repositories/products";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Custom Logo Leather Goods",
  description:
    "Genuine leather goods available with custom logo embossing — perfect for gifts, teams, and businesses.",
  alternates: { canonical: "/custom" },
};

export default async function CustomPage() {
  const products = await getCustomizableProducts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Custom", href: "/custom" }]} />

      <h1 className="mt-4 font-display text-3xl">Custom Logo Embossing</h1>
      <p className="mt-2 max-w-2xl text-ink/70">
        Add your logo, initials, or a personal message to any of the pieces below —
        a lasting mark on genuine leather.
      </p>

      <div className="mt-6 rounded-sm border border-cream-200 bg-cream-200/40 p-6">
        <p className="font-display text-lg">Have something more specific in mind?</p>
        <p className="mt-1 text-sm text-ink/70">
          Tell us what you&apos;re picturing — a fully bespoke piece, a bulk order for
          your team, or a design that isn&apos;t in the collection yet.
        </p>
        <ButtonLink href="/custom/request" className="mt-4">
          Request a Custom Piece
        </ButtonLink>
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-ink/60">
          No customizable products are available yet — check back soon.
        </p>
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
