import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// TEMPORARY — applies the add_custom_requests migration to production
// (DATABASE_URL/DIRECT_URL are Sensitive in Vercel, so `vercel env pull`
// can't surface them for a direct `migrate deploy` from this environment).
// Delete this file once run and confirmed.
const STATEMENTS = [
  `CREATE TYPE "CustomRequestStatus" AS ENUM ('NEW', 'IN_REVIEW', 'QUOTED', 'APPROVED', 'COMPLETED', 'DECLINED');`,
  `CREATE TABLE "CustomRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "budget" TEXT,
    "referenceImageUrl" TEXT,
    "referenceImageAlt" TEXT,
    "status" "CustomRequestStatus" NOT NULL DEFAULT 'NEW',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomRequest_pkey" PRIMARY KEY ("id")
  );`,
  `CREATE INDEX "CustomRequest_status_idx" ON "CustomRequest"("status");`,
  `CREATE INDEX "CustomRequest_userId_idx" ON "CustomRequest"("userId");`,
  `ALTER TABLE "CustomRequest" ADD CONSTRAINT "CustomRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;`,
  `ALTER TABLE "CustomRequest" ADD CONSTRAINT "CustomRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;`,
];

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "migrate-add-custom-requests") {
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

  if (action === "check-table") {
    try {
      const count = await prisma.customRequest.count();
      return NextResponse.json({ tableExists: true, count });
    } catch (error) {
      return NextResponse.json({ tableExists: false, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
