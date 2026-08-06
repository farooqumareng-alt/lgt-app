import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
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

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <div>
        <h1 className="font-display text-3xl">{product.name}</h1>
        <p className="mt-1 text-sm text-ink/70">SKU {product.sku}</p>
      </div>

      <Card className="p-6">
        <ProductForm
          action={updateProduct.bind(null, product.id)}
          categories={categories}
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
      </Card>

      <div>
        <h2 className="font-medium">Variants</h2>
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
      </div>

      {product.basePriceWholesale && (
        <div>
          <h2 className="font-medium">Wholesale Price Breaks</h2>
          <p className="mt-1 text-sm text-ink/70">
            Base wholesale price is ${Number(product.basePriceWholesale).toFixed(2)}. Breaks below apply at
            higher quantities.
          </p>
          <div className="mt-3 space-y-2">
            {product.priceBreaks.map((pb) => (
              <PriceBreakRow key={pb.id} priceBreak={{ ...pb, price: Number(pb.price) }} />
            ))}
          </div>
          <div className="mt-3">
            <AddPriceBreakForm productId={product.id} />
          </div>
        </div>
      )}

      <div>
        <h2 className="font-medium">Images</h2>
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
            categoryName={categories.find((c) => c.id === product.categoryId)?.name ?? ""}
            materials={product.materials}
          />
        </div>
      </div>
    </div>
  );
}
