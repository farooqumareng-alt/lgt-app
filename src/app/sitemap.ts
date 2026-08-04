import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

// Otherwise this route's DB queries run at build time (it's cached/static by
// default) — a transient database hiccup during a Vercel build would then fail
// the entire deployment, not just this route. Computing it per-request instead
// trades a bit of caching for that resilience.
export const dynamic = "force-dynamic";

const SITE_URL = process.env.AUTH_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ select: { urlSlug: true } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, category: { select: { urlSlug: true } }, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/custom`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/custom/request`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/shop/${category.urlSlug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/shop/${product.category.urlSlug}/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
