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

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
