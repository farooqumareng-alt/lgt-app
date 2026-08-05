import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAllCustomRequestsForAdmin } from "@/server/repositories/admin-custom-requests";
import type { CustomRequestStatus } from "@/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Custom Requests",
  robots: { index: false },
};

const STATUSES: CustomRequestStatus[] = ["NEW", "IN_REVIEW", "QUOTED", "APPROVED", "COMPLETED", "DECLINED"];

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminCustomRequestsPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const { status } = await searchParams;
  const validStatus = status && STATUSES.includes(status as CustomRequestStatus) ? (status as CustomRequestStatus) : undefined;

  const requests = await getAllCustomRequestsForAdmin(validStatus);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl">Custom Requests</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/custom-requests"
          className={`rounded-full border px-3 py-1 text-sm transition-colors duration-150 ${
            !validStatus ? "border-saddle bg-saddle text-cream-50" : "border-cream-300 hover:border-saddle"
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/custom-requests?status=${s}`}
            className={`rounded-full border px-3 py-1 text-sm transition-colors duration-150 ${
              validStatus === s ? "border-saddle bg-saddle text-cream-50" : "border-cream-300 hover:border-saddle"
            }`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {requests.length === 0 && <p className="text-ink/70">No requests match.</p>}
        {requests.map((r) => (
          <Link key={r.id} href={`/admin/custom-requests/${r.id}`}>
            <Card interactive stitched className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {r.name}
                  {r.product && (
                    <Badge variant="muted" className="ml-2">
                      {r.product.name}
                    </Badge>
                  )}
                </p>
                <p className="truncate text-xs text-ink/70">
                  {r.email} · {r.description.slice(0, 80)}
                  {r.description.length > 80 ? "…" : ""}
                </p>
              </div>
              <Badge variant={r.status === "NEW" ? "solid" : "outline"} className="ml-3 shrink-0">
                {r.status.replace("_", " ")}
              </Badge>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
