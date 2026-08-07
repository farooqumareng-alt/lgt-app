import type { Metadata } from "next";

import { requireRole } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { createBlogPost } from "@/server/actions/admin-blog";

export const metadata: Metadata = {
  title: "New Blog Post",
  robots: { index: false },
};

export default async function NewBlogPostPage() {
  await requireRole("ADMIN");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl">New Blog Post</h1>
      <Card className="mt-8 p-6">
        <BlogPostForm action={createBlogPost} submitLabel="Create Post" />
      </Card>
    </div>
  );
}
