const SITE_NAME = "Leather Goods Texas";
const SITE_URL = process.env.AUTH_URL ?? "http://localhost:3000";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function breadcrumbListJsonLd(items: { label: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

export function blogPostingJsonLd(post: {
  title: string;
  excerpt?: string | null;
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  coverImageUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.coverImageUrl ? { image: post.coverImageUrl } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt.toISOString() } : {}),
    dateModified: post.updatedAt.toISOString(),
    url: `${SITE_URL}/blog/${post.slug}`,
    author: { "@type": "Organization", name: SITE_NAME },
  };
}

export function productJsonLd(product: {
  name: string;
  description: string;
  sku: string;
  slug: string;
  categoryUrlSlug: string;
  price: number;
  inStock: boolean;
  imageUrl?: string;
  aggregateRating?: { averageRating: number; count: number };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    ...(product.imageUrl ? { image: product.imageUrl } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/shop/${product.categoryUrlSlug}/${product.slug}`,
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    // Only present once at least one real, approved review exists — never
    // fabricated to make a new listing look more established than it is.
    ...(product.aggregateRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.aggregateRating.averageRating.toFixed(1),
            reviewCount: product.aggregateRating.count,
          },
        }
      : {}),
  };
}
