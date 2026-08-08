import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

// Temporary route to create/clean up a disposable admin test account and any
// test products it creates, for verifying the New-Product image-upload
// feature live (needs a real BLOB_READ_WRITE_TOKEN, which only exists in
// production, not local dev). Removed from the repo immediately after use.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-maintenance-secret");
  if (!secret || secret !== process.env.MAINTENANCE_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "create-admin-tester") {
    const user = await prisma.user.upsert({
      where: { email: "qa-image-test@lgt-test-account.invalid" },
      update: {},
      create: {
        name: "QA Image Test Admin",
        email: "qa-image-test@lgt-test-account.invalid",
        passwordHash: "$2b$10$C406AS7VKyuGIzLXEk37r.UjelOdihRJZ.BvsO21T1ZW6KrMR0yIq",
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
    return NextResponse.json({ status: "created", userId: user.id });
  }

  if (action === "cleanup-admin-tester") {
    // Remove any products the test admin created (cascades to variants/images
    // via the schema's onDelete: Cascade — safe here since these are freshly
    // created test rows with no Order history).
    const deletedProducts = await prisma.product.deleteMany({ where: { sku: { startsWith: "QATEST-" } } });
    const deletedUser = await prisma.user.deleteMany({ where: { email: "qa-image-test@lgt-test-account.invalid" } });
    return NextResponse.json({ status: "cleaned", deletedProducts: deletedProducts.count, deletedUser: deletedUser.count });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
