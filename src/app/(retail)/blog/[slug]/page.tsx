import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/retail/breadcrumbs";
import { StructuredContent } from "@/components/retail/structured-content";
import { JsonLd, blogPostingJsonLd, breadcrumbListJsonLd } from "@/lib/seo/json-ld";
import { getPublishedBlogPostBySlug } from "@/server/repositories/blog";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <JsonLd data={breadcrumbListJsonLd(breadcrumbItems)} />
      <JsonLd data={blogPostingJsonLd(post)} />
      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="mt-4 font-display text-3xl">{post.title}</h1>
      {post.publishedAt && (
        <p className="mt-2 text-sm text-ink/50">
          {post.publishedAt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>
      )}

      {post.coverImageUrl && (
        // Plain <img>, not next/image — coverImageUrl is free-text admin
        // input, not restricted to an allowlisted image host.
        <div className="mt-6 aspect-[2/1] overflow-hidden rounded-sm border border-cream-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mt-6">
        <StructuredContent content={post.body} />
      </div>
    </div>
  );
}
