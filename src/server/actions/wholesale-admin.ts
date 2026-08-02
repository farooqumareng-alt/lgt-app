"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function approveWholesaleAccount(wholesaleAccountId: string) {
  const session = await requireRole("ADMIN");

  await prisma.$transaction(async (tx) => {
    const account = await tx.wholesaleAccount.update({
      where: { id: wholesaleAccountId },
      data: {
        approvalStatus: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    });
    // Never downgrade an ADMIN — a user testing their own wholesale application
    // (or any admin applying for legitimate business reasons) shouldn't lose
    // elevated access just because their application got approved.
    await tx.user.updateMany({
      where: { id: account.userId, role: { not: "ADMIN" } },
      data: { role: "WHOLESALER" },
    });
  });

  revalidatePath("/admin/wholesale-applications");
}

export async function rejectWholesaleAccount(wholesaleAccountId: string) {
  const session = await requireRole("ADMIN");

  await prisma.wholesaleAccount.update({
    where: { id: wholesaleAccountId },
    data: {
      approvalStatus: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
    },
  });

  revalidatePath("/admin/wholesale-applications");
}
