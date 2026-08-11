import type { Metadata } from "next";

import { requireRole } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { CategoryForm } from "@/components/admin/category-form";
import { createCategory } from "@/server/actions/admin-categories";

export const metadata: Metadata = {
  title: "New Category",
  robots: { index: false },
};

export default async function NewCategoryPage() {
  await requireRole("ADMIN");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl">New Category</h1>
      <Card className="mt-8 p-6">
        <CategoryForm action={createCategory} submitLabel="Create Category" />
      </Card>
    </div>
  );
}
