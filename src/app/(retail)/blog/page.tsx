import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/retail/breadcrumbs";
import { getPublishedBlogPosts } from "@/server/repositories/blog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: "Stories on leather craftsmanship, care, and what's new at Leather Goods Texas.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }]} />
      <h1 className="mt-4 font-display text-3xl">Blog</h1>

      {posts.length === 0 && <p className="mt-6 text-sm text-ink/70">No posts yet — check back soon.</p>}

      <div className="mt-8 space-y-8">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
            <article className="flex gap-5">
              {post.coverImageUrl && (
                // Plain <img>, not next/image — coverImageUrl is free-text
                // admin input, not restricted to an allowlisted image host.
                <div className="hidden h-28 w-40 shrink-0 overflow-hidden rounded-sm border border-cream-200 sm:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.coverImageUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <div>
                <h2 className="font-display text-xl group-hover:text-saddle">{post.title}</h2>
                {post.excerpt && <p className="mt-2 text-sm text-ink/70">{post.excerpt}</p>}
                {post.publishedAt && (
                  <p className="mt-2 text-xs text-ink/50">
                    {post.publishedAt.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
