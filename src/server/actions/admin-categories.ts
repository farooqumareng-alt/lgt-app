"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { CategorySchema } from "@/lib/validation/admin-categories";

export type CategoryActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

function parseCategoryForm(formData: FormData) {
  return CategorySchema.safeParse({
    name: formData.get("name"),
    urlSlug: formData.get("urlSlug"),
    description: formData.get("description"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    sortOrder: formData.get("sortOrder"),
  });
}

export async function createCategory(
  _prevState: CategoryActionResult | undefined,
  formData: FormData,
): Promise<CategoryActionResult> {
  await requireRole("ADMIN");
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.category.findUnique({ where: { urlSlug: parsed.data.urlSlug } });
  if (existing) {
    return { success: false, errors: { urlSlug: ["This URL slug is already in use."] } };
  }

  await prisma.category.create({
    data: {
      urlSlug: parsed.data.urlSlug,
      name: parsed.data.name,
      description: parsed.data.description || null,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
      sortOrder: parsed.data.sortOrder,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products/new");
  redirect("/admin/categories");
}

export async function updateCategory(
  categoryId: string,
  _prevState: CategoryActionResult | undefined,
  formData: FormData,
): Promise<CategoryActionResult> {
  await requireRole("ADMIN");
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const conflict = await prisma.category.findFirst({
    where: { urlSlug: parsed.data.urlSlug, id: { not: categoryId } },
  });
  if (conflict) {
    return { success: false, errors: { urlSlug: ["This URL slug is already in use."] } };
  }

  const existing = await prisma.category.findUnique({ where: { id: categoryId } });

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      urlSlug: parsed.data.urlSlug,
      name: parsed.data.name,
      description: parsed.data.description || null,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
      sortOrder: parsed.data.sortOrder,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}/edit`);
  revalidatePath("/shop");
  if (existing && existing.urlSlug !== parsed.data.urlSlug) {
    revalidatePath(`/shop/${existing.urlSlug}`);
  }
  revalidatePath(`/shop/${parsed.data.urlSlug}`);
  return { success: true };
}

// Never orphans products: the edit page only renders this action's trigger
// when getCategoryProductCount() is already 0, but the check is repeated
// here too since a product could get reassigned into this category in the
// moment between page load and submit — never trust a client-side gate alone.
export async function deleteCategory(categoryId: string) {
  await requireRole("ADMIN");

  const productCount = await prisma.product.count({ where: { categoryId } });
  if (productCount > 0) {
    throw new Error(
      `Can't delete — ${productCount} product${productCount === 1 ? "" : "s"} still use this category. Reassign them first.`,
    );
  }

  const category = await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath(`/shop/${category.urlSlug}`);
  redirect("/admin/categories");
}
