import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllCategoriesForAdmin } from "@/server/repositories/admin-categories";

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false },
};

export default async function AdminCategoriesPage() {
  await requireRole("ADMIN");
  const categories = await getAllCategoriesForAdmin();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Categories</h1>
        <ButtonLink href="/admin/categories/new">New Category</ButtonLink>
      </div>

      <div className="mt-8 space-y-3">
        {categories.length === 0 && <p className="text-ink/70">No categories yet.</p>}
        {categories.map((category) => (
          <Link key={category.id} href={`/admin/categories/${category.id}/edit`}>
            <Card interactive stitched className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{category.name}</p>
                <p className="text-xs text-ink/60">/shop/{category.urlSlug}</p>
              </div>
              <Badge variant="muted">
                {category._count.products} product{category._count.products === 1 ? "" : "s"}
              </Badge>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
