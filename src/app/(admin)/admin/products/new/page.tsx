import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/product-form";
import { getAllCategories } from "@/server/repositories/admin-products";
import { createProduct } from "@/server/actions/admin-products";

export const metadata: Metadata = {
  title: "New Product",
  robots: { index: false },
};

export default async function NewProductPage() {
  await requireRole("ADMIN");
  const categories = await getAllCategories();

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-12">
      <div className="sticky top-0 z-20 -mx-6 mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 bg-cream-50/95 px-6 py-4 backdrop-blur">
        <div>
          <Link href="/admin/products" className="text-xs text-saddle hover:underline">
            ← Products
          </Link>
          <h1 className="font-display text-xl">New Product</h1>
        </div>
        <Button type="submit" form="product-form">
          Create Product
        </Button>
      </div>

      <p className="mb-6 text-sm text-ink/70">
        Attach photos below, or skip them — variants, price breaks, and any remaining images can be added
        after the initial save.
      </p>

      <ProductForm action={createProduct} categories={categories} submitLabel="Create Product" isNew />
    </div>
  );
}
