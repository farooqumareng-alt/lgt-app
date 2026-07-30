import "dotenv/config";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Local-only dev fixture — never run this against a production DATABASE_URL.
// Creates a throwaway admin login for testing before the real admin panel (Phase 5)
// exists to manage users properly.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPasswordHash = await bcrypt.hash("changeme123", 10);

  await prisma.user.upsert({
    where: { email: "admin@lgt.test" },
    update: {},
    create: {
      name: "LGT Admin",
      email: "admin@lgt.test",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  console.log("Seeded admin@lgt.test / changeme123 (local dev only)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
