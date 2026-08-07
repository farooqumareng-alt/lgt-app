import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/retail/breadcrumbs";
import { ContactForm } from "@/components/retail/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Have a question about an order, a custom piece, or wholesale pricing? Get in touch.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }]} />
      <h1 className="mt-4 font-display text-3xl">Contact Us</h1>
      <p className="mt-2 text-ink/70">
        Have a question about an order, a custom piece, or wholesale pricing? Send us a message
        below and we&rsquo;ll get back to you.
      </p>
      <p className="mt-2 text-sm text-ink/50">
        For order questions, include your order number so we can help as quickly as possible. For
        custom or bespoke requests,{" "}
        <Link href="/custom/request" className="text-saddle hover:underline">
          use the custom request form
        </Link>{" "}
        instead — it gathers everything we need in one place.
      </p>

      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
