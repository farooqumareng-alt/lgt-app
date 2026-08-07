"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BlogPostSchema } from "@/lib/validation/admin-blog";
import type { AiBlogPostResult } from "@/lib/admin-ai";

export type BlogPostActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

function parseBlogPostForm(formData: FormData) {
  return BlogPostSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    coverImageUrl: formData.get("coverImageUrl"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
    isPublished: formData.get("isPublished") === "on",
  });
}

export async function createBlogPost(
  _prevState: BlogPostActionResult | undefined,
  formData: FormData,
): Promise<BlogPostActionResult> {
  await requireRole("ADMIN");
  const parsed = parseBlogPostForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { success: false, errors: { slug: ["This slug is already in use."] } };
  }

  const post = await prisma.blogPost.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt || null,
      body: parsed.data.body,
      coverImageUrl: parsed.data.coverImageUrl || null,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
      isPublished: parsed.data.isPublished,
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect(`/admin/blog/${post.id}/edit`);
}

export async function updateBlogPost(
  postId: string,
  _prevState: BlogPostActionResult | undefined,
  formData: FormData,
): Promise<BlogPostActionResult> {
  await requireRole("ADMIN");
  const parsed = parseBlogPostForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const conflict = await prisma.blogPost.findFirst({
    where: { slug: parsed.data.slug, id: { not: postId } },
  });
  if (conflict) {
    return { success: false, errors: { slug: ["This slug is already in use."] } };
  }

  const existing = await prisma.blogPost.findUnique({ where: { id: postId } });
  // Stamp publishedAt the first time a post goes live; never overwrite it on
  // later edits, and clear it if the post is unpublished again.
  const wasPublished = existing?.isPublished ?? false;
  const publishedAt = parsed.data.isPublished
    ? (existing?.publishedAt ?? new Date())
    : wasPublished
      ? null
      : existing?.publishedAt;

  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt || null,
      body: parsed.data.body,
      coverImageUrl: parsed.data.coverImageUrl || null,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
      isPublished: parsed.data.isPublished,
      publishedAt,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${postId}/edit`);
  revalidatePath("/blog");
  if (existing && existing.slug !== parsed.data.slug) {
    revalidatePath(`/blog/${existing.slug}`);
  }
  revalidatePath(`/blog/${parsed.data.slug}`);
  return { success: true };
}

export async function deleteBlogPost(postId: string) {
  await requireRole("ADMIN");
  const post = await prisma.blogPost.delete({ where: { id: postId } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  redirect("/admin/blog");
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Bridges the AI Blog Writer's generated draft into a real, reviewable
// BlogPost row — always created unpublished, regardless of what the admin
// had toggled elsewhere, so an AI draft can never go live without a human
// explicitly publishing it afterward. This is the "apply" step the
// Developer/Content agents were deliberately never given for code; content
// is different — a draft record with no live visibility is safe to create
// automatically, since nothing is public until a human hits Publish.
export async function createBlogPostDraftFromAi(topic: string, draft: AiBlogPostResult) {
  await requireRole("ADMIN");

  const baseSlug = slugify(topic) || "untitled-post";
  let slug = baseSlug;
  let suffix = 2;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const bulletsBlock = draft.bullets.length > 0 ? draft.bullets.map((b) => `- ${b}`).join("\n") : null;
  const body = [draft.introduction, bulletsBlock, draft.conclusion].filter(Boolean).join("\n\n");

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: draft.headline,
      excerpt: draft.introduction.slice(0, 280),
      body,
      metaTitle: draft.seoMetaTitle || null,
      metaDescription: draft.seoMetaDescription || null,
      isPublished: false,
    },
  });

  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${post.id}/edit`);
}
