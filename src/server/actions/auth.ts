"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LoginSchema, RegisterSchema } from "@/lib/validation/auth";

export type FormState =
  | { errors?: Record<string, string[]>; message?: string }
  | undefined;

export async function login(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/account",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Invalid email or password." };
    }
    throw error;
  }
}

export async function register(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { errors: { email: ["An account with this email already exists."] } };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  // Link any past guest orders placed with this email — registration only, never
  // re-checked on login. Known trade-off: without email verification (not yet
  // implemented), this grants a new account access to that email's guest order
  // history even if the registrant doesn't actually own the address. Accepted
  // deliberately; revisit once an email provider/verification flow exists.
  await prisma.order.updateMany({
    where: { userId: null, guestEmail: email },
    data: { userId: user.id, guestEmail: null },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/account" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: "Account created — please log in." };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
