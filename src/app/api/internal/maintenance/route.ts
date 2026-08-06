import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// TEMPORARY — applies the add_content_pages migration to production
// immediately, since the new footer queries ContentPage on every retail
// page load. Delete this file once run and confirmed.
const STATEMENTS = [
  `CREATE TABLE "ContentPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "showInFooter" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContentPage_pkey" PRIMARY KEY ("id")
  );`,
  `CREATE UNIQUE INDEX "ContentPage_slug_key" ON "ContentPage"("slug");`,
  `CREATE INDEX "ContentPage_slug_idx" ON "ContentPage"("slug");`,
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
      const rows = await prisma.$queryRawUnsafe('SELECT count(*)::int AS count FROM "ContentPage"');
      return NextResponse.json({ tableExists: true, rows });
    } catch (error) {
      return NextResponse.json({ tableExists: false, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
