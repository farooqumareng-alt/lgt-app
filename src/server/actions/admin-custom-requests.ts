"use server";

import { del } from "@vercel/blob";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import type { CustomRequestStatus } from "@/generated/prisma/enums";

export async function updateCustomRequestStatus(id: string, status: CustomRequestStatus, note?: string) {
  await requireRole("ADMIN");
  await prisma.customRequest.update({
    where: { id },
    data: { status, ...(note ? { adminNote: note } : {}) },
  });
  revalidatePath(`/admin/custom-requests/${id}`);
  revalidatePath("/admin/custom-requests");
}

// Reference images are Blob-hosted and nothing else ever references them, so
// this is a real hard delete, not a soft one — no order/product FK exposure
// like Products/Customers have. Blobs are cleaned up first so a request can
// never be deleted while leaving orphaned files behind.
export async function deleteCustomRequest(id: string) {
  await requireRole("ADMIN");

  const request = await prisma.customRequest.findUnique({
    where: { id },
    include: { images: { select: { url: true } } },
  });
  if (!request) return;

  await Promise.all(request.images.map((image) => del(image.url).catch(() => {})));
  await prisma.customRequest.delete({ where: { id } });

  revalidatePath("/admin/custom-requests");
  redirect("/admin/custom-requests");
}
