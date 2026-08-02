import type { Metadata } from "next";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { approveWholesaleAccount, rejectWholesaleAccount } from "@/server/actions/wholesale-admin";

export const metadata: Metadata = {
  title: "Wholesale Applications",
  robots: { index: false },
};

export default async function WholesaleApplicationsPage() {
  await requireRole("ADMIN");

  const accounts = await prisma.wholesaleAccount.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl">Wholesale Applications</h1>
      <div className="mt-8 space-y-4">
        {accounts.length === 0 && <p className="text-ink/60">No applications yet.</p>}
        {accounts.map((account) => (
          <Card key={account.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{account.businessName}</p>
                <p className="text-sm text-ink/60">
                  {account.user.name} — {account.user.email}
                </p>
                {account.taxId && <p className="text-sm text-ink/60">Tax ID: {account.taxId}</p>}
                <p className="text-sm text-ink/60">Phone: {account.phone}</p>
                {account.applicationNote && (
                  <p className="mt-2 text-sm text-ink/70">{account.applicationNote}</p>
                )}
                <p className="mt-2 text-xs uppercase tracking-wide text-ink/50">
                  {account.approvalStatus}
                </p>
              </div>
              {account.approvalStatus === "PENDING" && (
                <div className="flex shrink-0 gap-2">
                  <form action={approveWholesaleAccount.bind(null, account.id)}>
                    <Button type="submit">Approve</Button>
                  </form>
                  <form action={rejectWholesaleAccount.bind(null, account.id)}>
                    <Button type="submit" variant="secondary">
                      Reject
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
