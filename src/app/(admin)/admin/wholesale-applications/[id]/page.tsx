import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { WholesaleAccountEditForm } from "@/components/admin/wholesale-account-edit-form";
import {
  approveWholesaleAccount,
  rejectWholesaleAccount,
  suspendWholesaleAccount,
  reactivateWholesaleAccount,
} from "@/server/actions/wholesale-admin";

export const metadata: Metadata = {
  title: "Wholesale Account",
  robots: { index: false },
};

type BusinessAddress = {
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
};

type Props = { params: Promise<{ id: string }> };

export default async function AdminWholesaleAccountDetailPage({ params }: Props) {
  await requireRole("ADMIN");
  const { id } = await params;

  const account = await prisma.wholesaleAccount.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!account) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/admin/wholesale-applications" className="text-sm text-saddle hover:underline">
        ← Wholesale Applications
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">{account.businessName}</h1>
          <p className="text-sm text-ink/70">
            {account.user.name} — {account.user.email}
          </p>
        </div>
        <Badge variant={account.approvalStatus === "APPROVED" ? "solid" : "muted"}>{account.approvalStatus}</Badge>
      </div>

      <div className="mt-4 flex gap-2">
        {account.approvalStatus === "PENDING" && (
          <>
            <form action={approveWholesaleAccount.bind(null, account.id)}>
              <SubmitButton pendingLabel="Approving…">Approve</SubmitButton>
            </form>
            <form action={rejectWholesaleAccount.bind(null, account.id)}>
              <SubmitButton pendingLabel="Rejecting…" variant="secondary">
                Reject
              </SubmitButton>
            </form>
          </>
        )}
        {account.approvalStatus === "APPROVED" && (
          <form action={suspendWholesaleAccount.bind(null, account.id)}>
            <SubmitButton pendingLabel="Suspending…" variant="secondary">
              Suspend Account
            </SubmitButton>
          </form>
        )}
        {account.approvalStatus === "SUSPENDED" && (
          <form action={reactivateWholesaleAccount.bind(null, account.id)}>
            <SubmitButton pendingLabel="Reactivating…">Reactivate Account</SubmitButton>
          </form>
        )}
      </div>

      {account.applicationNote && (
        <Card className="mt-6 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Application Note</p>
          <p className="mt-1 text-sm text-ink/80">{account.applicationNote}</p>
        </Card>
      )}

      <Card className="mt-6 p-6">
        <WholesaleAccountEditForm
          accountId={account.id}
          businessName={account.businessName}
          phone={account.phone}
          website={account.website}
          storeType={account.storeType}
          taxId={account.taxId}
          ein={account.ein}
          businessAddress={account.businessAddress as BusinessAddress | null}
          netTermsDays={account.netTermsDays}
          creditLimit={account.creditLimit ? Number(account.creditLimit) : null}
          minimumOrderValue={account.minimumOrderValue ? Number(account.minimumOrderValue) : null}
        />
      </Card>
    </div>
  );
}
