import type { Metadata } from "next";
import Link from "next/link";

import { requireApprovedWholesaler } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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

export default async function WholesaleAccountPage() {
  const { wholesaleAccount } = await requireApprovedWholesaler();
  const address = wholesaleAccount.businessAddress as BusinessAddress | null;
  // Real, not aspirational — this is exactly the flag that drives whether
  // Stripe computes tax on checkout (see wholesale-customer.ts). A resale
  // cert on file is what makes the account tax-exempt, nothing else.
  const isTaxExempt = !!wholesaleAccount.taxId;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-2xl">Wholesale Account</h1>

      <Card className="mt-6 p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink/70">Business name</dt>
            <dd className="font-medium">{wholesaleAccount.businessName}</dd>
          </div>
          {wholesaleAccount.storeType && (
            <div className="flex justify-between">
              <dt className="text-ink/70">Store type</dt>
              <dd className="font-medium">{wholesaleAccount.storeType}</dd>
            </div>
          )}
          {wholesaleAccount.website && (
            <div className="flex justify-between">
              <dt className="text-ink/70">Website</dt>
              <dd className="font-medium">{wholesaleAccount.website}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink/70">Phone</dt>
            <dd className="font-medium">{wholesaleAccount.phone}</dd>
          </div>
          {address?.line1 && (
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-ink/70">Business address</dt>
              <dd className="text-right font-medium">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}, {address.state} {address.postalCode}
              </dd>
            </div>
          )}
          {wholesaleAccount.taxId && (
            <div className="flex justify-between">
              <dt className="text-ink/70">Resale cert / Tax ID</dt>
              <dd className="font-medium">{wholesaleAccount.taxId}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink/70">Tax-exempt status</dt>
            <dd>
              <Badge variant={isTaxExempt ? "solid" : "muted"}>
                {isTaxExempt ? "Exempt" : "Not on file"}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/70">Payment terms</dt>
            <dd className="font-medium">
              {wholesaleAccount.netTermsDays ? `Net ${wholesaleAccount.netTermsDays}` : "Card only"}
            </dd>
          </div>
          {wholesaleAccount.minimumOrderValue && (
            <div className="flex justify-between">
              <dt className="text-ink/70">Minimum order</dt>
              <dd className="font-medium">${Number(wholesaleAccount.minimumOrderValue).toFixed(2)}</dd>
            </div>
          )}
        </dl>
      </Card>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/wholesale/shop" className="text-saddle hover:underline">
          Wholesale Shop
        </Link>
        <Link href="/wholesale/orders" className="text-saddle hover:underline">
          Order History
        </Link>
        {wholesaleAccount.netTermsDays && (
          <Link href="/wholesale/invoices" className="text-saddle hover:underline">
            Invoices
          </Link>
        )}
        <Link href="/wholesale/catalog" className="text-saddle hover:underline">
          Download Catalog (CSV)
        </Link>
      </div>
    </div>
  );
}
