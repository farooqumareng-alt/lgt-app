import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

// Temporary, single-purpose maintenance endpoint for applying the
// NewsletterSubscriber migration to production directly (Vercel marks
// DATABASE_URL/DIRECT_URL Sensitive, so `vercel env pull` masks them —
// this is the established workaround for one-off production DB tasks).
// Removed again immediately after use.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "check") {
    try {
      await prisma.newsletterSubscriber.count();
      return NextResponse.json({ status: "table-exists" });
    } catch {
      return NextResponse.json({ status: "table-missing" });
    }
  }

  if (action === "migrate") {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
    `);
    return NextResponse.json({ status: "migrated" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
