import "server-only";
import { randomInt, createHash, timingSafeEqual } from "node:crypto";

import { prisma } from "@/lib/prisma";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
// Bounds brute-forcing the 6-digit code space (1M possibilities) within the
// TTL window. Once hit, the token is invalidated outright rather than left
// guessable — the user has to request a fresh one, same as on expiry.
const MAX_VERIFY_ATTEMPTS = 5;

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

/**
 * Single-use — the matching token is deleted on a correct guess, on expiry,
 * or once MAX_VERIFY_ATTEMPTS wrong guesses have been made, whichever comes
 * first. Looked up by identifier alone (not the old {identifier, token}
 * compound lookup) so every guess — right or wrong — hits the same row and
 * counts toward the limit; a wrong-code lookup on the compound key would
 * simply miss the index and never touch (or rate-limit) anything.
 */
export async function verifyOtpCode(email: string, code: string): Promise<boolean> {
  // createVerificationToken always clears prior rows first, so normally at
  // most one token exists per identifier — but there's no DB constraint
  // enforcing that, so two overlapping resend requests (double-click, two
  // tabs) can each pass the delete-then-create race and leave two live
  // rows. Preferring the newest keeps behavior predictable in that case:
  // the code from the most recent email is the one that verifies.
  const token = await prisma.verificationToken.findFirst({
    where: { identifier: email },
    orderBy: { expires: "desc" },
  });
  if (!token) return false;

  // Both sides are fixed-length sha256 hex digests, so this is safe without
  // extra length padding — guards the comparison itself against timing attacks.
  const matches = timingSafeEqual(Buffer.from(hashOtpCode(code)), Buffer.from(token.token));

  if (!matches) {
    const attempts = token.attempts + 1;
    if (attempts >= MAX_VERIFY_ATTEMPTS) {
      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    } else {
      await prisma.verificationToken.update({
        where: { identifier_token: { identifier: email, token: token.token } },
        data: { attempts },
      });
    }
    return false;
  }

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token: token.token } },
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
