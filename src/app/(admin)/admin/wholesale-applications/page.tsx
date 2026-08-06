import type { Metadata } from "next";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card } from "@/components/ui/card";
import { approveWholesaleAccount, rejectWholesaleAccount } from "@/server/actions/wholesale-admin";

export const metadata: Metadata = {
  title: "Wholesale Applications",
  robots: { index: false },
};

type BusinessAddress = {
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
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
        {accounts.length === 0 && <p className="text-ink/70">No applications yet.</p>}
        {accounts.map((account) => {
          const address = account.businessAddress as BusinessAddress | null;
          return (
            <Card key={account.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {account.businessName}
                    {account.storeType && <span className="ml-2 text-xs font-normal text-ink/50">{account.storeType}</span>}
                  </p>
                  <p className="text-sm text-ink/70">
                    {account.user.name} — {account.user.email}
                  </p>
                  <p className="text-sm text-ink/70">Phone: {account.phone}</p>
                  {account.website && <p className="text-sm text-ink/70">Website: {account.website}</p>}
                  {account.taxId && <p className="text-sm text-ink/70">Resale cert / Tax ID: {account.taxId}</p>}
                  {account.ein && <p className="text-sm text-ink/70">EIN: {account.ein}</p>}
                  {address?.line1 && (
                    <p className="text-sm text-ink/70">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                      {address.postalCode}
                    </p>
                  )}
                  {account.applicationNote && (
                    <p className="mt-2 text-sm text-ink/70">{account.applicationNote}</p>
                  )}
                  <p className="mt-2 text-xs uppercase tracking-wide text-ink/70">
                    {account.approvalStatus}
                  </p>
                </div>
                {account.approvalStatus === "PENDING" && (
                  <div className="flex shrink-0 gap-2">
                    <form action={approveWholesaleAccount.bind(null, account.id)}>
                      <SubmitButton pendingLabel="Approving…">Approve</SubmitButton>
                    </form>
                    <form action={rejectWholesaleAccount.bind(null, account.id)}>
                      <SubmitButton pendingLabel="Rejecting…" variant="secondary">
                        Reject
                      </SubmitButton>
                    </form>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
