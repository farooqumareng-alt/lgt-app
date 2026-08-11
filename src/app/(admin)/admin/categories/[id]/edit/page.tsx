import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteWithConfirmButton } from "@/components/admin/delete-with-confirm-button";
import { getCategoryForEdit, getCategoryProductCount } from "@/server/repositories/admin-categories";
import { deleteCategory, updateCategory } from "@/server/actions/admin-categories";

export const metadata: Metadata = {
  title: "Edit Category",
  robots: { index: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  await requireRole("ADMIN");
  const { id } = await params;
  const [category, productCount] = await Promise.all([getCategoryForEdit(id), getCategoryProductCount(id)]);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{category.name}</h1>
        {productCount > 0 ? (
          <p className="max-w-xs text-right text-xs text-ink/60">
            Can&apos;t delete — {productCount} product{productCount === 1 ? "" : "s"} still use this category.
          </p>
        ) : (
          <DeleteWithConfirmButton
            action={deleteCategory.bind(null, category.id)}
            confirmMessage={`Delete "${category.name}"? This cannot be undone.`}
          />
        )}
      </div>
      <Card className="mt-8 p-6">
        <CategoryForm
          action={updateCategory.bind(null, category.id)}
          defaultValues={{
            name: category.name,
            urlSlug: category.urlSlug,
            description: category.description,
            metaTitle: category.metaTitle,
            metaDescription: category.metaDescription,
            sortOrder: category.sortOrder,
          }}
        />
      </Card>
    </div>
  );
}
