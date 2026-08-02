import type { Metadata } from "next";
import Link from "next/link";

import { requireApprovedWholesaler } from "@/lib/dal";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Wholesale Account",
  robots: { index: false },
};

export default async function WholesaleAccountPage() {
  const { wholesaleAccount } = await requireApprovedWholesaler();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-2xl">Wholesale Account</h1>

      <Card className="mt-6 p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink/60">Business name</dt>
            <dd className="font-medium">{wholesaleAccount.businessName}</dd>
          </div>
          {wholesaleAccount.taxId && (
            <div className="flex justify-between">
              <dt className="text-ink/60">Tax ID</dt>
              <dd className="font-medium">{wholesaleAccount.taxId}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink/60">Phone</dt>
            <dd className="font-medium">{wholesaleAccount.phone}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">Payment terms</dt>
            <dd className="font-medium">
              {wholesaleAccount.netTermsDays ? `Net ${wholesaleAccount.netTermsDays}` : "Card only"}
            </dd>
          </div>
          {wholesaleAccount.minimumOrderValue && (
            <div className="flex justify-between">
              <dt className="text-ink/60">Minimum order</dt>
              <dd className="font-medium">${Number(wholesaleAccount.minimumOrderValue).toFixed(2)}</dd>
            </div>
          )}
        </dl>
      </Card>

      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/wholesale/shop" className="text-saddle hover:underline">
          Wholesale Shop
        </Link>
        <Link href="/wholesale/orders" className="text-saddle hover:underline">
          Order History
        </Link>
      </div>
    </div>
  );
}
