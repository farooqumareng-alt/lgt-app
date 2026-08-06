import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { WholesaleApplicationForm } from "@/components/wholesale/wholesale-application-form";

export const metadata: Metadata = {
  title: "Apply for Wholesale",
  robots: { index: false },
};

const BENEFITS = [
  "Wholesale pricing on every product",
  "Bulk order discounts via quantity price breaks",
  "Net terms available upon approval",
  "Tax-exempt purchasing with a valid resale certificate",
  "Custom logo embossing for private-label orders",
];

export default async function WholesaleApplyPage() {
  const session = await verifySession();

  if (session.user.role === "WHOLESALER") {
    redirect("/wholesale/shop");
  }
  const existing = await prisma.wholesaleAccount.findUnique({ where: { userId: session.user.id } });
  if (existing) {
    redirect("/wholesale/pending");
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 lg:grid-cols-[1fr_1.4fr]">
      <div className="rounded-sm border border-cream-200 bg-cream-50 p-8 outline outline-1 outline-dashed outline-offset-[-8px] outline-[rgba(143,101,47,0.35)]">
        <Badge variant="outline">Wholesale Program</Badge>
        <h1 className="mt-4 font-display text-3xl leading-tight">
          Bring genuine leather to your shelves.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/70">
          Leather Goods Texas supplies handcrafted belts, wallets, bags, and custom-branded
          pieces to retailers, boutiques, and resellers. Every approved account gets its own
          wholesale pricing and dealer dashboard.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-ink/80">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex gap-2">
              <span className="text-saddle">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs text-ink/50">
          Wholesale accounts are manually reviewed before approval — we&rsquo;ll follow up by
          email once your application has been checked.
        </p>
      </div>

      <div>
        <h2 className="font-display text-2xl">Wholesale Application</h2>
        <p className="mt-1 text-sm text-ink/70">
          Tell us about your business so we can review and set up your account.
        </p>
        <div className="mt-6">
          <WholesaleApplicationForm />
        </div>
      </div>
    </div>
  );
}
