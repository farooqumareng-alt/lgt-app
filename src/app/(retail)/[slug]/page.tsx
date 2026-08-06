import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/retail/breadcrumbs";
import { getContentPageBySlug } from "@/server/repositories/admin-content";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getContentPageBySlug(slug);
  if (!page) return {};

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function ContentPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = await getContentPageBySlug(slug);
  if (!page) notFound();

  const paragraphs = page.content.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: page.title, href: `/${page.slug}` }]} />
      <h1 className="mt-4 font-display text-3xl">{page.title}</h1>
      <div className="prose mt-6 space-y-4 text-ink/80">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="whitespace-pre-line leading-relaxed">
            {paragraph.trim()}
          </p>
        ))}
      </div>
    </div>
  );
}
