import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

// Temporary, single-purpose maintenance endpoint for applying the
// ContactMessage table migration to production directly. Removed again
// immediately after use.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "check") {
    const rows = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'ContactMessage';`,
    );
    return NextResponse.json({ exists: rows.length > 0 });
  }

  if (action === "migrate") {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ContactMessage" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "orderNumber" TEXT,
        "message" TEXT NOT NULL,
        "isResolved" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "ContactMessage_isResolved_createdAt_idx" ON "ContactMessage"("isResolved", "createdAt");`,
    );
    return NextResponse.json({ status: "migrated" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
