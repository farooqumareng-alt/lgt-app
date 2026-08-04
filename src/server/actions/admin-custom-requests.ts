"use server";

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
