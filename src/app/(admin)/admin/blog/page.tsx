import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAllBlogPostsForAdmin } from "@/server/repositories/admin-blog";

export const metadata: Metadata = {
  title: "Blog",
  robots: { index: false },
};

export default async function AdminBlogPage() {
  await requireRole("ADMIN");
  const posts = await getAllBlogPostsForAdmin();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Blog</h1>
        <ButtonLink href="/admin/blog/new">New Post</ButtonLink>
      </div>

      <div className="mt-8 space-y-3">
        {posts.length === 0 && (
          <p className="text-ink/70">
            No posts yet — write one directly, or generate a draft with the AI Blog Writer under
            the SEO Agent tab of the AI Assistant.
          </p>
        )}
        {posts.map((post) => (
          <Link key={post.id} href={`/admin/blog/${post.id}/edit`}>
            <Card interactive stitched className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">{post.title}</p>
                <p className="text-xs text-ink/60">/blog/{post.slug}</p>
              </div>
              <Badge variant={post.isPublished ? "solid" : "muted"}>
                {post.isPublished ? "Published" : "Draft"}
              </Badge>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
