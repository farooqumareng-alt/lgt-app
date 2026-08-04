import "server-only";
import { randomInt, createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

function hashOtpCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

/**
 * Creates a fresh OTP for the given email, replacing any prior one. Returns the
 * plaintext code (only ever held in memory, to send in the email) — the stored
 * VerificationToken row only ever contains the hash, same discipline as password
 * storage via bcrypt.
 */
export async function createVerificationToken(email: string): Promise<string> {
  const code = generateOtpCode();
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: email } }),
    prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashOtpCode(code),
        expires: new Date(Date.now() + OTP_TTL_MS),
      },
    }),
  ]);
  return code;
}

/** Single-use — the matching token is deleted whether verification succeeds or not. */
export async function verifyOtpCode(email: string, code: string): Promise<boolean> {
  const hashed = hashOtpCode(code);
  const token = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token: hashed } },
  });
  if (!token) return false;

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token: hashed } },
  });

  return token.expires > new Date();
}

/** Returns null if a resend is allowed, or the remaining cooldown message if not. */
export async function checkResendCooldown(email: string): Promise<string | null> {
  const existing = await prisma.verificationToken.findFirst({
    where: { identifier: email },
    orderBy: { expires: "desc" },
  });
  if (!existing) return null;

  const createdAt = existing.expires.getTime() - OTP_TTL_MS;
  const elapsed = Date.now() - createdAt;
  if (elapsed < RESEND_COOLDOWN_MS) {
    return "Please wait a moment before requesting another code.";
  }
  return null;
}
