"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AdminWholesaleAccountEditSchema } from "@/lib/validation/wholesale";

export type AdminWholesaleAccountActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

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

// SUSPENDED is enforced entirely through approvalStatus, not role — every
// real wholesale entry point (cart, checkout) already re-checks
// approvalStatus === "APPROVED" via requireApprovedWholesaler (the proxy's
// role check is just an optimistic first pass), so suspending here is
// immediately effective without touching the user's role at all.
export async function suspendWholesaleAccount(wholesaleAccountId: string) {
  const session = await requireRole("ADMIN");
  await prisma.wholesaleAccount.update({
    where: { id: wholesaleAccountId },
    data: { approvalStatus: "SUSPENDED", reviewedAt: new Date(), reviewedBy: session.user.id },
  });
  revalidatePath("/admin/wholesale-applications");
  revalidatePath(`/admin/wholesale-applications/${wholesaleAccountId}`);
}

export async function reactivateWholesaleAccount(wholesaleAccountId: string) {
  const session = await requireRole("ADMIN");
  await prisma.wholesaleAccount.update({
    where: { id: wholesaleAccountId },
    data: { approvalStatus: "APPROVED", reviewedAt: new Date(), reviewedBy: session.user.id },
  });
  revalidatePath("/admin/wholesale-applications");
  revalidatePath(`/admin/wholesale-applications/${wholesaleAccountId}`);
}

export async function updateWholesaleAccountAdmin(
  wholesaleAccountId: string,
  _prevState: AdminWholesaleAccountActionResult | undefined,
  formData: FormData,
): Promise<AdminWholesaleAccountActionResult> {
  await requireRole("ADMIN");

  const parsed = AdminWholesaleAccountEditSchema.safeParse({
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
    netTermsDays: formData.get("netTermsDays"),
    creditLimit: formData.get("creditLimit"),
    minimumOrderValue: formData.get("minimumOrderValue"),
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const hasAddress = parsed.data.addressLine1 || parsed.data.addressCity;

  await prisma.wholesaleAccount.update({
    where: { id: wholesaleAccountId },
    data: {
      businessName: parsed.data.businessName,
      phone: parsed.data.phone,
      website: parsed.data.website || null,
      storeType: parsed.data.storeType || null,
      taxId: parsed.data.taxId || null,
      ein: parsed.data.ein || null,
      businessAddress: hasAddress
        ? {
            line1: parsed.data.addressLine1 || "",
            line2: parsed.data.addressLine2 || null,
            city: parsed.data.addressCity || "",
            state: parsed.data.addressState || "",
            postalCode: parsed.data.addressPostalCode || "",
            country: "US",
          }
        : undefined,
      netTermsDays: parsed.data.netTermsDays,
      creditLimit: parsed.data.creditLimit,
      minimumOrderValue: parsed.data.minimumOrderValue,
    },
  });

  revalidatePath("/admin/wholesale-applications");
  revalidatePath(`/admin/wholesale-applications/${wholesaleAccountId}`);
  return { success: true };
}
