import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

// Temporary, single-purpose maintenance endpoint — deletes the test rows
// created while verifying the newsletter signup feature against production.
// Removed again immediately after use.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "cleanup-test-subscribers") {
    const result = await prisma.newsletterSubscriber.deleteMany({
      where: { email: { contains: "-verify-" } },
    });
    return NextResponse.json({ deleted: result.count });
  }

  if (action === "list-subscribers") {
    const rows = await prisma.newsletterSubscriber.findMany();
    return NextResponse.json({ rows });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
