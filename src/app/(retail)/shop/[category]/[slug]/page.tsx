import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/retail/breadcrumbs";
import { ProductImagePlaceholder } from "@/components/retail/product-image-placeholder";
import { VariantSelector } from "@/components/retail/variant-selector";
import { JsonLd, breadcrumbListJsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { getProductDetail } from "@/server/repositories/products";

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
        })}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-sm border border-cream-200">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          ) : (
            <ProductImagePlaceholder />
          )}
        </div>

        <div>
          {product.isCustomizable && <Badge variant="outline">Custom Logo Available</Badge>}
          <h1 className="mt-2 font-display text-3xl">{product.name}</h1>
          {product.shortDescription && (
            <p className="mt-2 text-ink/70">{product.shortDescription}</p>
          )}

          <div className="mt-6">
            <VariantSelector variants={product.variants} basePrice={product.basePrice} />
          </div>

          <div className="mt-8 space-y-4 border-t border-cream-200 pt-6">
            <p className="text-ink/80">{product.description}</p>
            {product.materials.length > 0 && (
              <p className="text-sm text-ink/60">
                <span className="font-medium text-ink">Materials:</span>{" "}
                {product.materials.join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
