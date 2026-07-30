import type { MetadataRoute } from "next";

const SITE_URL = process.env.AUTH_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/admin",
        "/wholesale/shop",
        "/wholesale/cart",
        "/wholesale/checkout",
        "/wholesale/orders",
        "/wholesale/account",
        "/api",
        "/checkout",
        "/cart",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
