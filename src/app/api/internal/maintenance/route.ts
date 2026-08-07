import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

// Temporary, single-purpose maintenance endpoint for applying the
// WholesaleAccount application-field columns to production directly.
// Removed again immediately after use.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "check") {
    const rows = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'WholesaleAccount' AND column_name IN ('website', 'storeType', 'ein', 'businessAddress');`,
    );
    return NextResponse.json({ columns: rows.map((r) => r.column_name) });
  }

  if (action === "migrate") {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "WholesaleAccount" ADD COLUMN IF NOT EXISTS "businessAddress" JSONB, ADD COLUMN IF NOT EXISTS "ein" TEXT, ADD COLUMN IF NOT EXISTS "storeType" TEXT, ADD COLUMN IF NOT EXISTS "website" TEXT;`,
    );
    return NextResponse.json({ status: "migrated" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
