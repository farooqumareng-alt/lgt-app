import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NewsletterSignupForm } from "@/components/retail/newsletter-signup-form";
import { ProductCard } from "@/components/retail/product-card";
import { getContentPageBySlug } from "@/server/repositories/admin-content";
import { getActiveCategories, getFeaturedProducts } from "@/server/repositories/products";

export const revalidate = 3600;

const TRUST_POINTS = [
  {
    title: "Full-Grain Leather",
    description: "The strongest, most durable layer of the hide — no shortcuts.",
  },
  {
    title: "Handcrafted",
    description: "Each piece is cut, stitched, and finished by hand.",
  },
  {
    title: "Custom Logo Embossing",
    description: "Add your mark to almost any piece in the collection.",
  },
  {
    title: "Retail & Wholesale",
    description: "Shop individually, or set up a wholesale account for your business.",
  },
];

// Pulls its excerpt straight from the live ContentPage row rather than a
// second, hand-duplicated blurb — one source of truth for brand-story copy,
// so the homepage teaser can never drift out of sync with the full page an
// admin edits at /admin/content.
function firstParagraph(content: string): string {
  const [first] = content.split(/\n\s*\n/).filter((p) => p.trim());
  return (first ?? "").trim();
}

export default async function HomePage() {
  const [categories, featuredProducts, ourStoryPage, craftsmanshipPage] = await Promise.all([
    getActiveCategories(),
    getFeaturedProducts(4),
    getContentPageBySlug("our-story"),
    getContentPageBySlug("craftsmanship"),
  ]);

  return (
    <div>
      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20">
        <p className="text-sm font-medium uppercase tracking-widest text-saddle">
          Genuine Leather, Since Day One
        </p>
        <h1 className="max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
          Belts, wallets, and handbags built to outlast trends.
        </h1>
        <p className="max-w-xl text-lg text-ink/70">
          Full-grain leather goods for individuals and businesses — with custom
          logo embossing available on every piece. Retail storefront and
          wholesale ordering, side by side.
        </p>
        <div className="flex gap-4">
          <ButtonLink href="/shop">Shop the Collection</ButtonLink>
          <ButtonLink href="/wholesale" variant="secondary">
            Wholesale Program
          </ButtonLink>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="font-display text-2xl">Shop by Category</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link key={category.id} href={`/shop/${category.urlSlug}`}>
                <Card interactive stitched className="p-5 text-center">
                  <p className="font-medium">{category.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-cream-200 bg-cream-50">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="font-display text-2xl">Why Leather Goods Texas</h2>
          <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {TRUST_POINTS.map((point) => (
              <div key={point.title}>
                <p className="font-medium">{point.title}</p>
                <p className="mt-1 text-sm text-ink/70">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="font-display text-2xl">Featured Pieces</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.slug} {...product} />
            ))}
          </div>
        </section>
      )}

      {(ourStoryPage || craftsmanshipPage) && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2">
            {ourStoryPage && (
              <Card stitched className="flex flex-col p-8">
                <p className="text-sm font-medium uppercase tracking-widest text-saddle">Our Story</p>
                <h2 className="mt-2 font-display text-2xl">{ourStoryPage.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">
                  {firstParagraph(ourStoryPage.content)}
                </p>
                <Link href="/our-story" className="mt-4 text-sm font-medium text-saddle hover:underline">
                  Read our story →
                </Link>
              </Card>
            )}
            {craftsmanshipPage && (
              <Card stitched className="flex flex-col p-8">
                <p className="text-sm font-medium uppercase tracking-widest text-saddle">Craftsmanship</p>
                <h2 className="mt-2 font-display text-2xl">{craftsmanshipPage.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">
                  {firstParagraph(craftsmanshipPage.content)}
                </p>
                <Link href="/craftsmanship" className="mt-4 text-sm font-medium text-saddle hover:underline">
                  See how it&rsquo;s made →
                </Link>
              </Card>
            )}
          </div>
        </section>
      )}

      <section className="border-t border-cream-200 bg-cream-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-saddle">Made Yours</p>
            <h2 className="mt-2 font-display text-2xl">Custom Logo Embossing</h2>
            <p className="mt-3 max-w-md text-sm text-ink/70">
              Add your logo, initials, or a personal message to almost any piece in the
              collection — a lasting mark on genuine leather, perfect for gifts, teams, and
              businesses.
            </p>
            <ButtonLink href="/custom" variant="secondary" className="mt-5">
              Explore Custom Embossing
            </ButtonLink>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-saddle">For Businesses</p>
            <h2 className="mt-2 font-display text-2xl">Wholesale Program</h2>
            <p className="mt-3 max-w-md text-sm text-ink/70">
              Approved accounts get flat wholesale pricing, quantity price breaks on bulk
              orders, and — for qualifying accounts — net-terms invoicing.
            </p>
            <ButtonLink href="/wholesale" variant="secondary" className="mt-5">
              Learn About Wholesale
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl">Stay in the Loop</h2>
            <p className="mt-1 max-w-md text-sm text-ink/70">
              New pieces, restocks, and the occasional behind-the-scenes look at the
              workbench — no spam, unsubscribe any time.
            </p>
          </div>
          <NewsletterSignupForm />
        </div>
      </section>
    </div>
  );
}
