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
  await prisma.user.create({ data: { name, email, passwordHash } });

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
