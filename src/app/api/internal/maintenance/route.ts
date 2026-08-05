import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// TEMPORARY — creates a dummy ADMIN account on production so the user can
// test admin features live without using the real admin's credentials.
// Delete this file once run and confirmed.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "create-dummy-admin") {
    const email = "dummy-admin@lgt-test-account.invalid";
    const passwordHash = "$2b$10$ZUPdMZ.N7LhM22YTWqFPL.WKImlID1dGxucTuMIbXYLa.q9UDtJnS";

    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: "ADMIN", emailVerified: new Date() },
      create: {
        email,
        name: "Dummy Admin (Test Account)",
        passwordHash,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
    return NextResponse.json({ id: user.id, email: user.email });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
