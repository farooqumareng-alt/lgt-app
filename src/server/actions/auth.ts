"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { checkResendCooldown, createVerificationToken, verifyOtpCode } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { LoginSchema, RegisterSchema } from "@/lib/validation/auth";

export type FormState =
  | { errors?: Record<string, string[]>; message?: string; needsVerification?: boolean }
  | undefined;

// Only ever a same-origin relative path — the `next` param is untrusted user
// input (it round-trips through a query string), so anything that could be
// interpreted as an external URL (a scheme, or `//host` protocol-relative)
// is rejected rather than handed to signIn's redirectTo, which would
// otherwise make this an open-redirect vector.
function safeNextPath(next: FormDataEntryValue | null): string | null {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export async function login(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user && user.passwordHash && !user.emailVerified) {
    return {
      message: "Please verify your email before signing in.",
      needsVerification: true,
    };
  }

  const next = safeNextPath(formData.get("next"));

  // An explicit `next` (e.g. arriving via /login?next=/wholesale/apply)
  // always wins over the role-based default — it means the visitor was
  // headed somewhere specific before being asked to sign in. Admins are the
  // one exception: /admin is where an admin account belongs regardless of
  // how they got to the login page. Wholesalers otherwise land on their own
  // portal home instead of the generic retail /account, which previously
  // sent every non-admin there with no regard for role.
  let redirectTo = next ?? "/account";
  if (user?.role === "ADMIN") {
    redirectTo = "/admin";
  } else if (!next && user?.role === "WHOLESALER") {
    redirectTo = "/wholesale/account";
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
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

  // Guest-order linking now happens in verifyEmail(), only once the registrant
  // has actually proven ownership of the address — see the plan doc for why this
  // moved out of here.
  const code = await createVerificationToken(email);
  try {
    await sendVerificationEmail(email, code);
  } catch (error) {
    // Never let an email-provider hiccup 500 the whole signup — the account and
    // its token already exist, so "Resend code" on the next page still works
    // once the underlying issue (bad key, provider outage) is fixed.
    console.error("sendVerificationEmail failed during registration:", error);
  }

  // Carries a caller-supplied destination (e.g. "start a wholesale
  // application") through the whole register → verify → login chain, so
  // arriving via /register?next=/wholesale/apply actually lands there
  // instead of the generic /account after signing in.
  const next = safeNextPath(formData.get("next"));
  const nextParam = next ? `&next=${encodeURIComponent(next)}` : "";
  redirect(`/verify-email?email=${encodeURIComponent(email)}${nextParam}`);
}

export type VerifyEmailState =
  | { success: true }
  | { success: false; message: string }
  | undefined;

export async function verifyEmail(
  _prevState: VerifyEmailState,
  formData: FormData,
): Promise<VerifyEmailState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const code = String(formData.get("code") ?? "").trim();

  if (!email || !code) {
    return { success: false, message: "Enter the code sent to your email." };
  }

  const isValid = await verifyOtpCode(email, code);
  if (!isValid) {
    return { success: false, message: "That code is invalid or expired. Request a new one below." };
  }

  const user = await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });

  // Now that email ownership is confirmed, link any guest orders placed with
  // this address.
  await prisma.order.updateMany({
    where: { userId: null, guestEmail: email },
    data: { userId: user.id, guestEmail: null },
  });

  const next = safeNextPath(formData.get("next"));
  const nextParam = next ? `&next=${encodeURIComponent(next)}` : "";
  redirect(`/login?verified=1${nextParam}`);
}

export type ResendState = { message: string } | undefined;

export async function resendVerificationCode(email: string): Promise<ResendState> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || user.emailVerified) {
    // Don't reveal whether the account exists or is already verified.
    return { message: "If that account needs verification, a new code has been sent." };
  }

  const cooldownMessage = await checkResendCooldown(normalizedEmail);
  if (cooldownMessage) {
    return { message: cooldownMessage };
  }

  const code = await createVerificationToken(normalizedEmail);
  try {
    await sendVerificationEmail(normalizedEmail, code);
  } catch (error) {
    console.error("sendVerificationEmail failed during resend:", error);
    return { message: "Something went wrong sending the email. Please try again shortly." };
  }
  return { message: "A new code has been sent." };
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
