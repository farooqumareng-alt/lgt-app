import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { CustomRequestStatusForm } from "@/components/admin/custom-request-status-form";
import { DeleteWithConfirmButton } from "@/components/admin/delete-with-confirm-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { deleteCustomRequest } from "@/server/actions/admin-custom-requests";
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
          <span className="text-ink/70">Email</span>
          <a href={`mailto:${request.email}`} className="font-medium text-saddle hover:underline">
            {request.email}
          </a>
        </div>
        {request.phone && (
          <div className="flex justify-between text-sm">
            <span className="text-ink/70">Phone</span>
            <span className="font-medium">{request.phone}</span>
          </div>
        )}
        {request.user && (
          <div className="flex justify-between text-sm">
            <span className="text-ink/70">Account</span>
            <span className="font-medium">{request.user.name ?? request.user.email}</span>
          </div>
        )}
        {request.product && (
          <div className="flex justify-between text-sm">
            <span className="text-ink/70">Closest product</span>
            <span className="font-medium">{request.product.name}</span>
          </div>
        )}
        {request.budget && (
          <div className="flex justify-between text-sm">
            <span className="text-ink/70">Budget</span>
            <span className="font-medium">{request.budget}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-ink/70">Submitted</span>
          <span className="font-medium">{request.createdAt.toLocaleDateString()}</span>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/70">Description</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{request.description}</p>
      </Card>

      {request.images.length > 0 && (
        <Card className="mt-6 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/70">
            Reference Image{request.images.length === 1 ? "" : "s"}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {request.images.map((image) => (
              <div key={image.id} className="relative aspect-square overflow-hidden rounded-sm border border-cream-200">
                <Image src={image.url} alt={image.altText} fill className="object-cover" sizes="200px" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {request.adminNote && (
        <Card className="mt-6 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/70">Admin Note</p>
          <p className="mt-2 text-sm text-ink/80">{request.adminNote}</p>
        </Card>
      )}

      <div className="mt-6 flex items-center justify-between">
        <CustomRequestStatusForm id={request.id} currentStatus={request.status} />
        <DeleteWithConfirmButton
          action={deleteCustomRequest.bind(null, request.id)}
          confirmMessage={`Delete this custom request from ${request.name}? This cannot be undone.`}
        />
      </div>
    </div>
  );
}
