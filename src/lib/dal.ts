import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
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
