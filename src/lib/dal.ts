import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/generated/prisma/enums";

export const verifySession = cache(async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
});

export async function requireRole(role: UserRole) {
  const session = await verifySession();
  if (session.user.role !== role) {
    redirect("/login");
  }
  return session;
}

/**
 * The real wholesale enforcement point — proxy.ts's route gate only checks the
 * (cookie-derived, optimistic) role, not approval status. Every wholesale
 * repository/action call re-checks approvalStatus here.
 */
export const requireApprovedWholesaler = cache(async () => {
  const session = await verifySession();
  const wholesaleAccount = await prisma.wholesaleAccount.findUnique({
    where: { userId: session.user.id },
  });
  if (!wholesaleAccount || wholesaleAccount.approvalStatus !== "APPROVED") {
    redirect("/wholesale/pending");
  }
  return { session, wholesaleAccount };
});
