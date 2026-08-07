"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ContentPageSchema } from "@/lib/validation/admin-content";

export type ContentPageActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

// A content page's slug becomes /<slug> at the top of the retail route
// group — never allow one to shadow a real app route.
const RESERVED_SLUGS = new Set([
  "shop",
  "custom",
  "wholesale",
  "cart",
  "checkout",
  "account",
  "login",
  "register",
  "verify-email",
  "admin",
  "api",
  "contact",
  "blog",
  "sitemap.xml",
  "robots.txt",
]);

function parseContentPageForm(formData: FormData) {
  return ContentPageSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    content: formData.get("content"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    showInFooter: formData.get("showInFooter") === "on",
  });
}

export async function createContentPage(
  _prevState: ContentPageActionResult | undefined,
  formData: FormData,
): Promise<ContentPageActionResult> {
  await requireRole("ADMIN");
  const parsed = parseContentPageForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  if (RESERVED_SLUGS.has(parsed.data.slug)) {
    return { success: false, errors: { slug: ["This slug is reserved by the application."] } };
  }

  const existing = await prisma.contentPage.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { success: false, errors: { slug: ["This slug is already in use."] } };
  }

  await prisma.contentPage.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      content: parsed.data.content,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
      showInFooter: parsed.data.showInFooter,
    },
  });

  revalidatePath("/admin/content");
  revalidatePath(`/${parsed.data.slug}`);
  redirect("/admin/content");
}

export async function updateContentPage(
  pageId: string,
  _prevState: ContentPageActionResult | undefined,
  formData: FormData,
): Promise<ContentPageActionResult> {
  await requireRole("ADMIN");
  const parsed = parseContentPageForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  if (RESERVED_SLUGS.has(parsed.data.slug)) {
    return { success: false, errors: { slug: ["This slug is reserved by the application."] } };
  }

  const conflict = await prisma.contentPage.findFirst({
    where: { slug: parsed.data.slug, id: { not: pageId } },
  });
  if (conflict) {
    return { success: false, errors: { slug: ["This slug is already in use."] } };
  }

  const existing = await prisma.contentPage.findUnique({ where: { id: pageId } });

  await prisma.contentPage.update({
    where: { id: pageId },
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      content: parsed.data.content,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
      showInFooter: parsed.data.showInFooter,
    },
  });

  revalidatePath("/admin/content");
  revalidatePath(`/${parsed.data.slug}`);
  if (existing && existing.slug !== parsed.data.slug) {
    revalidatePath(`/${existing.slug}`);
  }
  return { success: true };
}

export async function deleteContentPage(pageId: string) {
  await requireRole("ADMIN");
  const page = await prisma.contentPage.delete({ where: { id: pageId } });
  revalidatePath("/admin/content");
  revalidatePath(`/${page.slug}`);
  redirect("/admin/content");
}
