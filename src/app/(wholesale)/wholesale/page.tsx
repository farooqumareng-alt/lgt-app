import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Wholesale",
  description: "Wholesale pricing and bulk ordering for Leather Goods Texas.",
};

export default async function WholesaleLandingPage() {
  const session = await auth();
  let ctaHref = "/register";
  let ctaLabel = "Create an Account to Apply";

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
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="font-display text-4xl">Wholesale Program</h1>
      <p className="mt-4 text-ink/70">
        Genuine leather goods at wholesale pricing for retailers, boutiques, and resellers.
        Approved accounts get flat wholesale pricing, quantity price breaks on bulk orders,
        and — for qualifying accounts — net-terms invoicing.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <ButtonLink href={ctaHref}>{ctaLabel}</ButtonLink>
        <Link href="/shop" className="flex items-center text-sm font-medium hover:text-saddle">
          Browse retail catalog
        </Link>
      </div>
    </div>
  );
}
