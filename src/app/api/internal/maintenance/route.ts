import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// TEMPORARY — cleanup for a live production smoke test of multi-image
// custom requests. Only touches the fixed test-email namespace. Delete
// this file once the test is confirmed and cleaned up.
const TEST_EMAIL_SUFFIX = "@lgt-smoketest.invalid";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");
  const email = request.nextUrl.searchParams.get("email");

  if (action === "inspect") {
    if (!email || !email.endsWith(TEST_EMAIL_SUFFIX)) {
      return NextResponse.json({ error: "Only test-namespace emails allowed" }, { status: 400 });
    }
    const row = await prisma.customRequest.findFirst({ where: { email }, include: { images: true } });
    return NextResponse.json({ row });
  }

  if (action === "cleanup") {
    if (!email || !email.endsWith(TEST_EMAIL_SUFFIX)) {
      return NextResponse.json({ error: "Only test-namespace emails allowed" }, { status: 400 });
    }
    const rows = await prisma.customRequest.findMany({ where: { email }, include: { images: true } });
    const imageUrls = rows.flatMap((r) => r.images.map((i) => i.url));
    const deleted = await prisma.customRequest.deleteMany({ where: { email } });
    return NextResponse.json({ deletedRows: deleted.count, imageUrls });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
