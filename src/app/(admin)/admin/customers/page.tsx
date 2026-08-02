import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllCustomersForAdmin } from "@/server/repositories/admin-customers";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminCustomersPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const { q } = await searchParams;
  const customers = await getAllCustomersForAdmin(q?.trim() || undefined);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl">Customers</h1>

      <form className="mt-6 flex items-end gap-3" method="get">
        <div>
          <label className="text-xs text-ink/60">Search</label>
          <Input name="q" defaultValue={q ?? ""} placeholder="Name or email" />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="mt-8 space-y-3">
        {customers.length === 0 && <p className="text-ink/60">No customers match.</p>}
        {customers.map((customer) => (
          <Link key={customer.id} href={`/admin/customers/${customer.id}`}>
            <Card className="flex items-center justify-between p-4 hover:border-saddle">
              <div>
                <p className="text-sm font-medium">{customer.name ?? "—"}</p>
                <p className="text-xs text-ink/60">{customer.email}</p>
              </div>
              <div className="text-right text-sm text-ink/70">
                <p>
                  {customer.orderCount} order{customer.orderCount === 1 ? "" : "s"}
                </p>
                <p>${customer.lifetimeSpend.toFixed(2)} lifetime</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
