import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { WholesaleApplicationForm } from "@/components/wholesale/wholesale-application-form";

export const metadata: Metadata = {
  title: "Apply for Wholesale",
  robots: { index: false },
};

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
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-display text-3xl">Apply for a Wholesale Account</h1>
      <p className="mt-2 text-sm text-ink/70">
        We&apos;ll review your application and follow up once it&apos;s approved.
      </p>
      <div className="mt-8">
        <WholesaleApplicationForm />
      </div>
    </div>
  );
}
