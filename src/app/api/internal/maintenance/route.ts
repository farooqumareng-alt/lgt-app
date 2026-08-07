import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

// Temporary route to create a disposable, fully-approved wholesaler test
// account for verifying the login-redirect fix on production, and to
// remove it again afterward. Removed from the repo immediately after use.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "create-wholesaler") {
    const user = await prisma.user.upsert({
      where: { email: "deep-test-wholesaler@lgt-test-account.invalid" },
      update: {},
      create: {
        name: "Deep Test Wholesaler",
        email: "deep-test-wholesaler@lgt-test-account.invalid",
        passwordHash: "$2b$10$WoyjxYac7fv8SXTxeYgZY.XZALNbFdLeG3qgW4TtPqMTlb8/EBYrq",
        role: "WHOLESALER",
        emailVerified: new Date(),
      },
    });
    await prisma.wholesaleAccount.upsert({
      where: { userId: user.id },
      update: { approvalStatus: "APPROVED" },
      create: {
        userId: user.id,
        businessName: "Deep Test Wholesale Co",
        phone: "5125550188",
        taxId: "TX-DEEPTEST-1",
        approvalStatus: "APPROVED",
        netTermsDays: 30,
        minimumOrderValue: 0,
      },
    });
    return NextResponse.json({ status: "created", userId: user.id });
  }

  if (action === "cleanup-wholesaler") {
    await prisma.wholesaleAccount.deleteMany({
      where: { user: { email: "deep-test-wholesaler@lgt-test-account.invalid" } },
    });
    const deleted = await prisma.user.deleteMany({
      where: { email: "deep-test-wholesaler@lgt-test-account.invalid" },
    });
    return NextResponse.json({ status: "cleaned", deleted: deleted.count });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
