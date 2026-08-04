import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// TEMPORARY, one-time-use route to grandfather existing users' emailVerified
// before deploying the OTP-verification login gate. Gated by a secret env var
// (not by session/role) since it must be usable via a plain POST before any
// session-based check is relevant. Delete this file once the grandfathering
// step has been run against production and confirmed.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "grandfather") {
    const result = await prisma.user.updateMany({
      where: { emailVerified: null },
      data: { emailVerified: new Date() },
    });
    const remaining = await prisma.user.count({ where: { emailVerified: null } });
    return NextResponse.json({ updated: result.count, remainingUnverified: remaining });
  }

  if (action === "count-unverified") {
    const remaining = await prisma.user.count({ where: { emailVerified: null } });
    const total = await prisma.user.count();
    return NextResponse.json({ remainingUnverified: remaining, total });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
