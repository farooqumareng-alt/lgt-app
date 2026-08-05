import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// TEMPORARY — applies the custom_request_multi_images migration to
// production before the dependent code deploys. Delete once run/confirmed.
const STATEMENTS = [
  `CREATE TABLE "CustomRequestImage" (
    "id" TEXT NOT NULL,
    "customRequestId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomRequestImage_pkey" PRIMARY KEY ("id")
  );`,
  `CREATE INDEX "CustomRequestImage_customRequestId_idx" ON "CustomRequestImage"("customRequestId");`,
  `ALTER TABLE "CustomRequestImage" ADD CONSTRAINT "CustomRequestImage_customRequestId_fkey" FOREIGN KEY ("customRequestId") REFERENCES "CustomRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
  // Backfill any existing single-image rows into the new table before
  // dropping the old columns, so nothing already submitted is lost.
  `INSERT INTO "CustomRequestImage" ("id", "customRequestId", "url", "altText", "sortOrder")
   SELECT gen_random_uuid()::text, "id", "referenceImageUrl", COALESCE("referenceImageAlt", 'Reference image'), 0
   FROM "CustomRequest" WHERE "referenceImageUrl" IS NOT NULL;`,
  `ALTER TABLE "CustomRequest" DROP COLUMN "referenceImageAlt", DROP COLUMN "referenceImageUrl";`,
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
      const rows = await prisma.$queryRawUnsafe('SELECT count(*)::int AS count FROM "CustomRequestImage"');
      return NextResponse.json({ tableExists: true, rows });
    } catch (error) {
      return NextResponse.json({ tableExists: false, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
