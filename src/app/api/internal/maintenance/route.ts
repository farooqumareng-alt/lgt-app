import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

// Temporary, single-purpose maintenance endpoint for applying the BlogPost
// table migration to production directly. Removed again immediately after
// use.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "check") {
    const rows = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'BlogPost';`,
    );
    return NextResponse.json({ exists: rows.length > 0 });
  }

  if (action === "migrate") {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BlogPost" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "excerpt" TEXT,
        "body" TEXT NOT NULL,
        "coverImageUrl" TEXT,
        "metaTitle" TEXT,
        "metaDescription" TEXT,
        "isPublished" BOOLEAN NOT NULL DEFAULT false,
        "publishedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug");`);
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "BlogPost_isPublished_publishedAt_idx" ON "BlogPost"("isPublished", "publishedAt");`,
    );
    return NextResponse.json({ status: "migrated" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
