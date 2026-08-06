"use server";

import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { WholesaleApplicationSchema } from "@/lib/validation/wholesale";

export type WholesaleApplicationResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

// Every new application starts with this default minimum order value —
// admin can still hand-adjust an individual account's terms afterward
// (same informal Prisma-Studio-editing pattern already used for
// netTermsDays/creditLimit, since no dedicated "edit terms" admin UI
// exists yet). Not a hard schema default so it stays overridable per row.
const DEFAULT_MINIMUM_ORDER_VALUE = 250;

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
    phone: formData.get("phone"),
    website: formData.get("website"),
    storeType: formData.get("storeType"),
    taxId: formData.get("taxId"),
    ein: formData.get("ein"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"),
    addressCity: formData.get("addressCity"),
    addressState: formData.get("addressState"),
    addressPostalCode: formData.get("addressPostalCode"),
    applicationNote: formData.get("applicationNote"),
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.wholesaleAccount.create({
    data: {
      userId: session.user.id,
      businessName: parsed.data.businessName,
      phone: parsed.data.phone,
      website: parsed.data.website || null,
      storeType: parsed.data.storeType,
      taxId: parsed.data.taxId,
      ein: parsed.data.ein || null,
      businessAddress: {
        line1: parsed.data.addressLine1,
        line2: parsed.data.addressLine2 || null,
        city: parsed.data.addressCity,
        state: parsed.data.addressState,
        postalCode: parsed.data.addressPostalCode,
        country: "US",
      },
      applicationNote: parsed.data.applicationNote || null,
      minimumOrderValue: DEFAULT_MINIMUM_ORDER_VALUE,
    },
  });

  redirect("/wholesale/pending");
}
