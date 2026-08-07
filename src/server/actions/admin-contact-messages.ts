"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function toggleContactMessageResolved(id: string) {
  await requireRole("ADMIN");
  const message = await prisma.contactMessage.findUnique({ where: { id }, select: { isResolved: true } });
  if (!message) return;

  await prisma.contactMessage.update({ where: { id }, data: { isResolved: !message.isResolved } });
  revalidatePath("/admin/contact-messages");
}
