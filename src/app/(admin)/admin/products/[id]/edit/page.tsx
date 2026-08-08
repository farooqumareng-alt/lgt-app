import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/product-form";
import { VariantRow } from "@/components/admin/variant-row";
import { AddVariantForm } from "@/components/admin/add-variant-form";
import { PriceBreakRow } from "@/components/admin/price-break-row";
import { AddPriceBreakForm } from "@/components/admin/add-price-break-form";
import { ProductImageGallery } from "@/components/admin/product-image-gallery";
import { ImageUploadForm } from "@/components/admin/image-upload-form";
import { GenerateImageForm } from "@/components/admin/generate-image-form";
import { getAllCategories, getProductForEdit } from "@/server/repositories/admin-products";
import { updateProduct } from "@/server/actions/admin-products";

export const metadata: Metadata = {
  title: "Edit Product",
  robots: { index: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  await requireRole("ADMIN");
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductForEdit(id), getAllCategories()]);

  if (!product) notFound();

  const category = categories.find((c) => c.id === product.categoryId);
  const storefrontUrl = category ? `/shop/${category.urlSlug}/${product.slug}` : null;

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-12">
      {/* Sticky action bar — the product's identity and the one thing every
          visit to this page ends in (Save) stay reachable no matter how far
          down a long product's Variants/Images sections you've scrolled. */}
      <div className="sticky top-0 z-20 -mx-6 mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 bg-cream-50/95 px-6 py-4 backdrop-blur">
        <div className="min-w-0">
          <Link href="/admin/products" className="text-xs text-saddle hover:underline">
            ← Products
          </Link>
          <h1 className="truncate font-display text-xl">{product.name}</h1>
          <p className="text-xs text-ink/60">SKU {product.sku}</p>
        </div>
        <div className="flex items-center gap-4">
          {storefrontUrl && product.isActive && (
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-saddle hover:underline"
            >
              View on storefront ↗
            </a>
          )}
          <Button type="submit" form="product-form">
            Save Product
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="font-display text-lg">Images</h2>
          <div className="mt-3">
            <ProductImageGallery images={product.images} />
          </div>
          <div className="mt-4">
            <ImageUploadForm productId={product.id} />
          </div>
          <div className="mt-4">
            <GenerateImageForm
              productId={product.id}
              name={product.name}
              categoryName={category?.name ?? ""}
              materials={product.materials}
            />
          </div>
        </div>

        <ProductForm
          action={updateProduct.bind(null, product.id)}
          categories={categories}
          productImages={product.images.map((image) => ({ url: image.url, altText: image.altText }))}
          defaultValues={{
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            categoryId: product.categoryId,
            shortDescription: product.shortDescription,
            description: product.description,
            materials: product.materials,
            dimensions: product.dimensions,
            careInstructions: product.careInstructions,
            isCustomizable: product.isCustomizable,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            basePriceRetail: Number(product.basePriceRetail),
            basePriceWholesale: product.basePriceWholesale ? Number(product.basePriceWholesale) : null,
            metaTitle: product.metaTitle,
            metaDescription: product.metaDescription,
          }}
        />

        <Card className="p-5">
          <h2 className="font-display text-lg">Variants</h2>
          <div className="mt-3 space-y-2">
            {product.variants.map((variant) => (
              <VariantRow
                key={variant.id}
                variant={{
                  ...variant,
                  priceRetailOverride: variant.priceRetailOverride ? Number(variant.priceRetailOverride) : null,
                  priceWholesaleOverride: variant.priceWholesaleOverride
                    ? Number(variant.priceWholesaleOverride)
                    : null,
                }}
              />
            ))}
          </div>
          <div className="mt-3">
            <AddVariantForm productId={product.id} />
          </div>
        </Card>

        {product.basePriceWholesale && (
          <Card className="p-5">
            <h2 className="font-display text-lg">Wholesale Price Breaks</h2>
            <p className="mt-1 text-sm text-ink/70">
              Base wholesale price is ${Number(product.basePriceWholesale).toFixed(2)}. Breaks below apply at
              higher quantities.
            </p>
            {product.priceBreaks.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[360px]">
                  <thead>
                    <tr className="border-b border-cream-300 text-left text-xs uppercase tracking-wide text-ink/60">
                      <th className="pb-2 pr-4 font-medium">Minimum qty</th>
                      <th className="pb-2 pr-4 font-medium">Price each</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {product.priceBreaks.map((pb) => (
                      <PriceBreakRow key={pb.id} priceBreak={{ ...pb, price: Number(pb.price) }} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-3">
              <AddPriceBreakForm productId={product.id} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
