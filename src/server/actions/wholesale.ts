"use server";

import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { WholesaleApplicationSchema } from "@/lib/validation/account";

export type WholesaleApplicationResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

export async function applyForWholesale(
  _prevState: WholesaleApplicationResult | undefined,
  formData: FormData,
): Promise<WholesaleApplicationResult> {
  const session = await verifySession();

  const existing = await prisma.wholesaleAccount.findUnique({ where: { userId: session.user.id } });
  if (existing) {
    redirect("/wholesale/pending");
  }

  const parsed = WholesaleApplicationSchema.safeParse({
    businessName: formData.get("businessName"),
    taxId: formData.get("taxId"),
    phone: formData.get("phone"),
    applicationNote: formData.get("applicationNote"),
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.wholesaleAccount.create({
    data: {
      userId: session.user.id,
      businessName: parsed.data.businessName,
      taxId: parsed.data.taxId || null,
      phone: parsed.data.phone,
      applicationNote: parsed.data.applicationNote || null,
    },
  });

  redirect("/wholesale/pending");
}
