import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

import { JsonLd, organizationJsonLd } from "@/lib/seo/json-ld";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LGT — Genuine Leather Goods",
    template: "%s | LGT",
  },
  description:
    "Genuine leather belts, wallets, keychains, purses, handbags, and custom logo-embossed leather goods — retail and wholesale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream font-sans text-ink antialiased">
        <JsonLd data={organizationJsonLd()} />
        {children}
      </body>
    </html>
  );
}
