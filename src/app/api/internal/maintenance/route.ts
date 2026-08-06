import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

// Temporary, single-purpose maintenance endpoint for applying the
// Order.amountRefunded / Order.refundedAt migration to production
// directly. Removed again immediately after use.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "check") {
    const rows = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'Order' AND column_name IN ('amountRefunded', 'refundedAt');`,
    );
    return NextResponse.json({ columns: rows.map((r) => r.column_name) });
  }

  if (action === "migrate") {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "amountRefunded" DECIMAL(10,2), ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP(3);`,
    );
    return NextResponse.json({ status: "migrated" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
