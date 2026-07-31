"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import {
  ChangeEmailSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
} from "@/lib/validation/account";

export type AccountActionResult =
  | { success: true; message?: string }
  | { success: false; errors?: Record<string, string[]>; message?: string };

export async function updateProfile(
  _prevState: AccountActionResult | undefined,
  formData: FormData,
): Promise<AccountActionResult> {
  const session = await verifySession();
  const parsed = UpdateProfileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/account/settings");
  return { success: true, message: "Name updated." };
}

export async function changeEmail(
  _prevState: AccountActionResult | undefined,
  formData: FormData,
): Promise<AccountActionResult> {
  const session = await verifySession();
  const parsed = ChangeEmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing && existing.id !== session.user.id) {
    return { success: false, errors: { email: ["That email is already in use."] } };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { email: parsed.data.email },
  });

  revalidatePath("/account/settings");
  return { success: true, message: "Email updated." };
}

export async function changePassword(
  _prevState: AccountActionResult | undefined,
  formData: FormData,
): Promise<AccountActionResult> {
  const session = await verifySession();
  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) {
    return { success: false, message: "Password login isn't set up for this account." };
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, errors: { currentPassword: ["Current password is incorrect."] } };
  }

  const newPasswordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newPasswordHash },
  });

  revalidatePath("/account/settings");
  return { success: true, message: "Password updated." };
}
