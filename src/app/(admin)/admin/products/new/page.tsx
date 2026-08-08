import type { Metadata } from "next";

import { requireRole } from "@/lib/dal";
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
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <h1 className="font-display text-3xl">New Product</h1>
      <p className="mt-1 text-sm text-ink/70">
        Attach photos below, or skip them — variants, price breaks, and any remaining images can be
        added after the initial save.
      </p>
      <div className="mt-8">
        <ProductForm action={createProduct} categories={categories} submitLabel="Create Product" isNew />
      </div>
    </div>
  );
}
