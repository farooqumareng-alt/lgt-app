import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { DeleteWithConfirmButton } from "@/components/admin/delete-with-confirm-button";
import { getBlogPostForEdit } from "@/server/repositories/admin-blog";
import { deleteBlogPost, updateBlogPost } from "@/server/actions/admin-blog";

export const metadata: Metadata = {
  title: "Edit Blog Post",
  robots: { index: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPostPage({ params }: Props) {
  await requireRole("ADMIN");
  const { id } = await params;
  const post = await getBlogPostForEdit(id);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{post.title}</h1>
        <DeleteWithConfirmButton
          action={deleteBlogPost.bind(null, post.id)}
          confirmMessage={`Delete "${post.title}"? This cannot be undone.`}
        />
      </div>
      <Card className="mt-8 p-6">
        <BlogPostForm
          action={updateBlogPost.bind(null, post.id)}
          defaultValues={{
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            body: post.body,
            coverImageUrl: post.coverImageUrl,
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            isPublished: post.isPublished,
          }}
        />
      </Card>
    </div>
  );
}
