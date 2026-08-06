import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// TEMPORARY — EMERGENCY FIX: applies the product_image_ai_flag migration
// to production. This column is missing there, and every query touching
// ProductImage (including the homepage's cart lookup) is 500ing site-wide.
// Delete this file once run and confirmed.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "migrate") {
    try {
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "ProductImage" ADD COLUMN IF NOT EXISTS "isAiGenerated" BOOLEAN NOT NULL DEFAULT false;',
      );
      return NextResponse.json({ ok: true });
    } catch (error) {
      return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (action === "check") {
    try {
      const rows = await prisma.$queryRawUnsafe(
        'SELECT column_name FROM information_schema.columns WHERE table_name = \'ProductImage\' ORDER BY ordinal_position',
      );
      return NextResponse.json({ columns: rows });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  // Full-repo audit: dump every table's actual columns so they can be diffed
  // against schema.prisma directly, instead of guessing one table at a time.
  if (action === "audit") {
    try {
      const tables = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
      );
      const result: Record<string, string[]> = {};
      for (const t of tables) {
        const cols = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
          `SELECT column_name FROM information_schema.columns WHERE table_name = '${t.table_name}' ORDER BY ordinal_position`,
        );
        result[t.table_name] = cols.map((c) => c.column_name);
      }
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
