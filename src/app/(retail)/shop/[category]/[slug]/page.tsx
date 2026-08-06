import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/retail/breadcrumbs";
import { ProductCard } from "@/components/retail/product-card";
import { ProductGallery } from "@/components/retail/product-gallery";
import { ReviewsSection } from "@/components/retail/reviews-section";
import { StarRating } from "@/components/retail/star-rating";
import { VariantSelector } from "@/components/retail/variant-selector";
import { JsonLd, breadcrumbListJsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { getProductDetail, getRelatedProducts } from "@/server/repositories/products";
import { getReviewSummary } from "@/server/repositories/reviews";

export const revalidate = 3600;

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const product = await getProductDetail(category, slug);
  if (!product) return {};

  const title = product.metaTitle ?? `${product.name} | Genuine Leather ${product.category.name}`;
  const description =
    product.metaDescription ?? product.shortDescription ?? product.description;

  return {
    title,
    description,
    alternates: { canonical: `/shop/${product.category.urlSlug}/${product.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { category, slug } = await params;
  const product = await getProductDetail(category, slug);
  if (!product) notFound();

  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const inStock = product.variants.some((variant) => variant.stockQuantity > 0);
  const [relatedProducts, reviewSummary] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id),
    getReviewSummary(product.id),
  ]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: product.category.name, href: `/shop/${product.category.urlSlug}` },
    { label: product.name, href: `/shop/${product.category.urlSlug}/${product.slug}` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <JsonLd data={breadcrumbListJsonLd(breadcrumbItems)} />
      <JsonLd
        data={productJsonLd({
          name: product.name,
          description: product.description,
          sku: product.sku,
          slug: product.slug,
          categoryUrlSlug: product.category.urlSlug,
          price: product.basePrice,
          inStock,
          imageUrl: primaryImage?.url,
          aggregateRating:
            reviewSummary.count > 0 && reviewSummary.averageRating !== null
              ? { averageRating: reviewSummary.averageRating, count: reviewSummary.count }
              : undefined,
        })}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.isCustomizable && <Badge variant="outline">Custom Logo Available</Badge>}
          <h1 className="mt-2 font-display text-3xl">{product.name}</h1>
          {reviewSummary.count > 0 && reviewSummary.averageRating !== null && (
            <Link href="#reviews" className="mt-2 flex items-center gap-2">
              <StarRating rating={reviewSummary.averageRating} />
              <span className="text-sm text-ink/70">
                {reviewSummary.averageRating.toFixed(1)} ({reviewSummary.count} review
                {reviewSummary.count === 1 ? "" : "s"})
              </span>
            </Link>
          )}
          {product.shortDescription && (
            <p className="mt-2 text-ink/70">{product.shortDescription}</p>
          )}

          <div className="mt-6">
            <VariantSelector variants={product.variants} basePrice={product.basePrice} />
          </div>

          <div className="mt-8 space-y-4 border-t border-cream-200 pt-6">
            <p className="text-ink/80">{product.description}</p>

            {(product.materials.length > 0 || product.dimensions) && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                {product.materials.length > 0 && (
                  <>
                    <dt className="font-medium text-ink">Materials</dt>
                    <dd className="text-ink/70">{product.materials.join(", ")}</dd>
                  </>
                )}
                {product.dimensions && (
                  <>
                    <dt className="font-medium text-ink">Dimensions</dt>
                    <dd className="text-ink/70">{product.dimensions}</dd>
                  </>
                )}
              </dl>
            )}

            {product.careInstructions && (
              <div>
                <p className="text-sm font-medium text-ink">Care Instructions</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink/70">
                  {product.careInstructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReviewsSection productId={product.id} />

      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-cream-200 pt-10">
          <h2 className="font-display text-2xl">You May Also Like</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.slug} {...related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
