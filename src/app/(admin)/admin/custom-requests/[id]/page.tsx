import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { CustomRequestStatusForm } from "@/components/admin/custom-request-status-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCustomRequestForAdmin } from "@/server/repositories/admin-custom-requests";

export const metadata: Metadata = {
  title: "Custom Request",
  robots: { index: false },
};

export default async function AdminCustomRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  const request = await getCustomRequestForAdmin(id);
  if (!request) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">{request.name}</h1>
        <Badge variant={request.status === "NEW" ? "solid" : "outline"}>{request.status.replace("_", " ")}</Badge>
      </div>

      <Card className="mt-6 space-y-3 p-6">
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">Email</span>
          <a href={`mailto:${request.email}`} className="font-medium text-saddle hover:underline">
            {request.email}
          </a>
        </div>
        {request.phone && (
          <div className="flex justify-between text-sm">
            <span className="text-ink/60">Phone</span>
            <span className="font-medium">{request.phone}</span>
          </div>
        )}
        {request.user && (
          <div className="flex justify-between text-sm">
            <span className="text-ink/60">Account</span>
            <span className="font-medium">{request.user.name ?? request.user.email}</span>
          </div>
        )}
        {request.product && (
          <div className="flex justify-between text-sm">
            <span className="text-ink/60">Closest product</span>
            <span className="font-medium">{request.product.name}</span>
          </div>
        )}
        {request.budget && (
          <div className="flex justify-between text-sm">
            <span className="text-ink/60">Budget</span>
            <span className="font-medium">{request.budget}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">Submitted</span>
          <span className="font-medium">{request.createdAt.toLocaleDateString()}</span>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Description</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{request.description}</p>
      </Card>

      {request.referenceImageUrl && (
        <Card className="mt-6 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Reference Image</p>
          <div className="relative mt-3 h-64 w-full overflow-hidden rounded-sm">
            <Image
              src={request.referenceImageUrl}
              alt={request.referenceImageAlt ?? "Reference image"}
              fill
              className="object-contain"
              sizes="600px"
            />
          </div>
        </Card>
      )}

      {request.adminNote && (
        <Card className="mt-6 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Admin Note</p>
          <p className="mt-2 text-sm text-ink/80">{request.adminNote}</p>
        </Card>
      )}

      <div className="mt-6">
        <CustomRequestStatusForm id={request.id} currentStatus={request.status} />
      </div>
    </div>
  );
}
