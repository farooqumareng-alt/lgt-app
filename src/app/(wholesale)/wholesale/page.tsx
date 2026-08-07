import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getActiveCategories } from "@/server/repositories/products";

export const metadata: Metadata = {
  title: "Wholesale",
  description:
    "Become an approved wholesale partner — premium handcrafted leather goods for retailers, boutiques, and resellers.",
};

const BENEFITS = [
  {
    title: "Wholesale Pricing",
    description: "Flat wholesale pricing on every product, with quantity price breaks on bulk orders.",
  },
  {
    title: "Net Terms",
    description: "Qualifying accounts can check out on Net terms instead of paying by card up front.",
  },
  {
    title: "Tax-Exempt Purchasing",
    description: "A valid resale certificate on file makes your account tax-exempt at checkout, automatically.",
  },
  {
    title: "Custom Branding",
    description: "Private-label orders with your logo embossed, for retail-ready or corporate-gift pieces.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Submit Application",
    description: "Tell us about your business — store type, resale certificate, and address.",
  },
  {
    step: "2",
    title: "Review",
    description: "We review every application personally and follow up by email with a decision.",
  },
  {
    step: "3",
    title: "Get Access",
    description: "Approved accounts get wholesale pricing, bulk ordering, and their own dealer dashboard.",
  },
];

const FAQ = [
  {
    question: "Do I need a resale certificate to apply?",
    answer:
      "Yes — a resale certificate or tax ID is required for most US businesses. It's also what qualifies your account for tax-exempt purchasing.",
  },
  {
    question: "Is there a minimum order?",
    answer: "Yes, new wholesale accounts start with a $250 minimum order value.",
  },
  {
    question: "Can I customize products with my own logo?",
    answer: "Yes — custom logo embossing is available on wholesale orders for private-label and corporate gifting.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Not yet — wholesale orders currently ship within the United States only.",
  },
];

export default async function WholesaleLandingPage() {
  const [session, categories] = await Promise.all([auth(), getActiveCategories()]);

  let ctaHref = "/register?next=/wholesale/apply";
  let ctaLabel = "Apply for a Wholesale Account";

  if (session?.user) {
    if (session.user.role === "WHOLESALER") {
      ctaHref = "/wholesale/shop";
      ctaLabel = "Go to Wholesale Shop";
    } else {
      const existing = await prisma.wholesaleAccount.findUnique({ where: { userId: session.user.id } });
      if (existing) {
        ctaHref = "/wholesale/pending";
        ctaLabel = "View Application Status";
      } else {
        ctaHref = "/wholesale/apply";
        ctaLabel = "Apply for a Wholesale Account";
      }
    }
  }

  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-saddle">Wholesale Program</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
          Become an Approved Wholesale Partner
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink/70">
          Leather Goods Texas supplies handcrafted leather goods to retailers, boutiques, western
          stores, and online resellers. Approved accounts get their own wholesale pricing, bulk
          ordering, and dealer dashboard.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink href={ctaHref}>{ctaLabel}</ButtonLink>
          <Link href="/shop" className="flex items-center text-sm font-medium hover:text-saddle">
            Browse retail catalog
          </Link>
        </div>
      </section>

      <section className="border-t border-cream-200 bg-cream-50">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-center font-display text-2xl">Why Partner With Us</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit) => (
              <Card key={benefit.title} stitched className="p-6">
                <p className="font-medium">{benefit.title}</p>
                <p className="mt-2 text-sm text-ink/70">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-center font-display text-2xl">What You&rsquo;ll Carry</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-sm border border-cream-200 bg-cream-50 p-5 text-center outline outline-1 outline-dashed outline-offset-[-5px] outline-[rgba(143,101,47,0.4)]"
              >
                <p className="font-medium">{category.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-cream-200 bg-cream-50">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <h2 className="text-center font-display text-2xl">How It Works</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-saddle font-display text-lg text-cream-50">
                  {item.step}
                </div>
                <p className="mt-3 font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-ink/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="text-center font-display text-2xl">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-6">
          {FAQ.map((item) => (
            <div key={item.question}>
              <p className="font-medium">{item.question}</p>
              <p className="mt-1 text-sm text-ink/70">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-cream-200 bg-cream-50">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-display text-2xl">Ready to Apply?</h2>
          <p className="mt-2 text-sm text-ink/70">
            Applications are reviewed personally — we&rsquo;ll follow up by email with a decision.
          </p>
          <div className="mt-6">
            <ButtonLink href={ctaHref}>{ctaLabel}</ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
