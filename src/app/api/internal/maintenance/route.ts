import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// TEMPORARY — applies the add_ai_activity_log migration to production
// (that table's migration was never committed/applied, so /admin/ai has
// been 500ing). Delete this file once run and confirmed.
const STATEMENTS = [
  `CREATE TABLE "AiActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiActivityLog_pkey" PRIMARY KEY ("id")
  );`,
  `CREATE INDEX "AiActivityLog_userId_idx" ON "AiActivityLog"("userId");`,
  `CREATE INDEX "AiActivityLog_type_idx" ON "AiActivityLog"("type");`,
  `ALTER TABLE "AiActivityLog" ADD CONSTRAINT "AiActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
];

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "migrate") {
    const results: string[] = [];
    for (const sql of STATEMENTS) {
      try {
        await prisma.$executeRawUnsafe(sql);
        results.push("ok");
      } catch (error) {
        results.push(`error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return NextResponse.json({ results });
  }

  if (action === "check") {
    try {
      const rows = await prisma.$queryRawUnsafe('SELECT count(*)::int AS count FROM "AiActivityLog"');
      return NextResponse.json({ tableExists: true, rows });
    } catch (error) {
      return NextResponse.json({ tableExists: false, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
