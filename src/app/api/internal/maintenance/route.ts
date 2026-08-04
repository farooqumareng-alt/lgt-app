import { createHash } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// TEMPORARY, one-time-use route for a deep-test pass of the OTP verification
// flow against production. Gated by a secret env var. Only operates on
// emails under a fixed test namespace — never touches real accounts. Delete
// this file once the test pass is confirmed and cleaned up.
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
    const code = request.nextUrl.searchParams.get("code") ?? "112233";
    const expiredParam = request.nextUrl.searchParams.get("expired") === "1";
    const hash = createHash("sha256").update(code).digest("hex");
    const expires = expiredParam ? new Date(Date.now() - 60 * 1000) : new Date(Date.now() + 10 * 60 * 1000);
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({ data: { identifier: email, token: hash, expires } });
    return NextResponse.json({ seeded: true, code, expired: expiredParam });
  }

  if (action === "backdate-token") {
    // Push the token's implied "createdAt" (expires - TTL) further into the
    // past so the 60s resend cooldown reads as elapsed, without waiting.
    if (!isTestEmail(email)) {
      return NextResponse.json({ error: "Only test-namespace emails allowed" }, { status: 400 });
    }
    const token = await prisma.verificationToken.findFirst({ where: { identifier: email } });
    if (!token) return NextResponse.json({ error: "No token found" }, { status: 404 });
    await prisma.verificationToken.update({
      where: { identifier_token: { identifier: email, token: token.token } },
      data: { expires: new Date(Date.now() - 5 * 60 * 1000) }, // now "expired" and old enough for cooldown
    });
    return NextResponse.json({ backdated: true });
  }

  if (action === "token-info") {
    if (!isTestEmail(email)) {
      return NextResponse.json({ error: "Only test-namespace emails allowed" }, { status: 400 });
    }
    const token = await prisma.verificationToken.findFirst({ where: { identifier: email } });
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });
    return NextResponse.json({ hasToken: !!token, expires: token?.expires ?? null, user });
  }

  if (action === "seed-guest-order") {
    if (!isTestEmail(email)) {
      return NextResponse.json({ error: "Only test-namespace emails allowed" }, { status: 400 });
    }
    const order = await prisma.order.create({
      data: {
        orderNumber: `TEST-${Date.now()}`,
        userId: null,
        guestEmail: email,
        status: "PAID",
        subtotal: 10,
        shippingTotal: 0,
        taxTotal: 0,
        grandTotal: 10,
        currency: "USD",
        shippingAddress: { line1: "123 Test St", city: "Austin", state: "TX", postalCode: "78701", country: "US" },
        stripeCheckoutSessionId: `test_${Date.now()}`,
      },
    });
    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber });
  }

  if (action === "check-order-linked") {
    if (!isTestEmail(email)) {
      return NextResponse.json({ error: "Only test-namespace emails allowed" }, { status: 400 });
    }
    const orders = await prisma.order.findMany({
      where: { OR: [{ guestEmail: email }, { user: { email } }] },
      select: { orderNumber: true, userId: true, guestEmail: true },
    });
    return NextResponse.json({ orders });
  }

  if (action === "cleanup") {
    if (!isTestEmail(email)) {
      return NextResponse.json({ error: "Only test-namespace emails allowed" }, { status: 400 });
    }
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.order.deleteMany({ where: { guestEmail: email } });
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.order.deleteMany({ where: { userId: user.id } });
    }
    const deleted = await prisma.user.deleteMany({ where: { email } });
    return NextResponse.json({ deletedUsers: deleted.count });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
