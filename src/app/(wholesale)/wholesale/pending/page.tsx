import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Wholesale Application Status",
  robots: { index: false },
};

export default async function WholesalePendingPage() {
  const session = await verifySession();

  if (session.user.role === "WHOLESALER") {
    redirect("/wholesale/shop");
  }

  const account = await prisma.wholesaleAccount.findUnique({ where: { userId: session.user.id } });
  if (!account) {
    redirect("/wholesale/apply");
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      {account.approvalStatus === "PENDING" && (
        <>
          <h1 className="font-display text-3xl">Application Under Review</h1>
          <p className="mt-4 text-ink/70">
            Thanks for applying, {account.businessName}. We&apos;re reviewing your application
            and will follow up soon. Check back here for updates.
          </p>
        </>
      )}
      {account.approvalStatus === "REJECTED" && (
        <>
          <h1 className="font-display text-3xl">Application Not Approved</h1>
          <p className="mt-4 text-ink/70">
            Your wholesale application wasn&apos;t approved at this time. If you believe this is
            a mistake or your business has changed, please contact us.
          </p>
        </>
      )}
      {account.approvalStatus === "SUSPENDED" && (
        <>
          <h1 className="font-display text-3xl">Account Suspended</h1>
          <p className="mt-4 text-ink/70">
            Your wholesale account is currently suspended. Please contact us for details.
          </p>
        </>
      )}
      <div className="mt-8">
        <ButtonLink href="/" variant="secondary">
          Back to Home
        </ButtonLink>
      </div>
    </div>
  );
}
