"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AdminCustomerEditSchema } from "@/lib/validation/admin-customers";

export type AdminCustomerActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

export async function updateCustomerAdmin(
  userId: string,
  _prevState: AdminCustomerActionResult | undefined,
  formData: FormData,
): Promise<AdminCustomerActionResult> {
  await requireRole("ADMIN");

  const parsed = AdminCustomerEditSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const conflict = await prisma.user.findFirst({
    where: { email: parsed.data.email, id: { not: userId } },
  });
  if (conflict) {
    return { success: false, errors: { email: ["This email is already in use by another account."] } };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name: parsed.data.name, email: parsed.data.email },
  });

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${userId}`);
  return { success: true };
}

// Customers with real order or custom-request history are never deletable —
// both relations are intentionally left without a cascade/set-null action in
// the schema (see Order.user / CustomRequest.user), so this check exists to
// give a clear message instead of letting the admin hit a raw FK violation.
export async function deleteCustomerAdmin(userId: string) {
  await requireRole("ADMIN");

  const [orderCount, customRequestCount] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.customRequest.count({ where: { userId } }),
  ]);

  if (orderCount > 0 || customRequestCount > 0) {
    const reasons = [
      orderCount > 0 ? `${orderCount} order${orderCount === 1 ? "" : "s"}` : null,
      customRequestCount > 0 ? `${customRequestCount} custom request${customRequestCount === 1 ? "" : "s"}` : null,
    ].filter(Boolean);
    return { success: false as const, message: `Can't delete — this customer has ${reasons.join(" and ")} on record.` };
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}
