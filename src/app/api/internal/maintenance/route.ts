import { createHash } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// TEMPORARY, one-time-use route for a post-deploy smoke test of the OTP
// verification flow against production. Gated by a secret env var. Only
// operates on emails under a fixed test namespace — never touches real
// accounts. Delete this file once the smoke test is confirmed and cleaned up.
const TEST_EMAIL_SUFFIX = "@lgt-smoketest.invalid";

function isTestEmail(email: string | null): email is string {
  return !!email && email.endsWith(TEST_EMAIL_SUFFIX);
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");
  const email = request.nextUrl.searchParams.get("email");

  if (action === "seed-code") {
    if (!isTestEmail(email)) {
      return NextResponse.json({ error: "Only test-namespace emails allowed" }, { status: 400 });
    }
    const code = "112233";
    const hash = createHash("sha256").update(code).digest("hex");
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: hash, expires: new Date(Date.now() + 10 * 60 * 1000) },
    });
    return NextResponse.json({ seeded: true });
  }

  if (action === "cleanup") {
    if (!isTestEmail(email)) {
      return NextResponse.json({ error: "Only test-namespace emails allowed" }, { status: 400 });
    }
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    const deleted = await prisma.user.deleteMany({ where: { email } });
    return NextResponse.json({ deletedUsers: deleted.count });
  }

  // One fixed, idempotent statement — matches
  // prisma/migrations/20260804205112_drop_verification_token_unique_index.
  // Real bug: VerificationToken.token had a bare @unique in addition to the
  // standard Auth.js @@unique([identifier, token]), so two different users
  // issued the same random 6-digit code (identifier differs, code collides)
  // would fail to insert with P2002 instead of just working.
  if (action === "migrate-drop-token-unique") {
    await prisma.$executeRawUnsafe('DROP INDEX IF EXISTS "VerificationToken_token_key";');
    return NextResponse.json({ migrated: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
