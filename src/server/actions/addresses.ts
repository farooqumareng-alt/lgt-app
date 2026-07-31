"use server";

import { revalidatePath } from "next/cache";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AddressSchema } from "@/lib/validation/account";

export type AddressActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

function parseAddressForm(formData: FormData) {
  return AddressSchema.safeParse({
    label: formData.get("label"),
    fullName: formData.get("fullName"),
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || "US",
    phone: formData.get("phone"),
  });
}

export async function createAddress(
  _prevState: AddressActionResult | undefined,
  formData: FormData,
): Promise<AddressActionResult> {
  const session = await verifySession();
  const parsed = parseAddressForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const makeDefault = formData.get("isDefault") === "on";

  await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }
    await tx.address.create({
      data: { ...parsed.data, userId: session.user.id, isDefault: makeDefault },
    });
  });

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function updateAddress(
  addressId: string,
  _prevState: AddressActionResult | undefined,
  formData: FormData,
): Promise<AddressActionResult> {
  const session = await verifySession();
  const existing = await prisma.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== session.user.id) {
    return { success: false, message: "Address not found." };
  }

  const parsed = parseAddressForm(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const makeDefault = formData.get("isDefault") === "on";

  await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }
    await tx.address.update({
      where: { id: addressId },
      data: { ...parsed.data, isDefault: makeDefault },
    });
  });

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddress(addressId: string): Promise<AddressActionResult> {
  const session = await verifySession();
  const existing = await prisma.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== session.user.id) {
    return { success: false, message: "Address not found." };
  }

  await prisma.address.delete({ where: { id: addressId } });
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function setDefaultAddress(addressId: string): Promise<AddressActionResult> {
  const session = await verifySession();
  const existing = await prisma.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== session.user.id) {
    return { success: false, message: "Address not found." };
  }

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    }),
    prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account/addresses");
  return { success: true };
}
