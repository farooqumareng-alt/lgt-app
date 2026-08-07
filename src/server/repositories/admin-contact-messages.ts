import "server-only";

import { prisma } from "@/lib/prisma";

export function getAllContactMessagesForAdmin(filter: "open" | "resolved" | "all" = "open") {
  return prisma.contactMessage.findMany({
    where: filter === "all" ? undefined : { isResolved: filter === "resolved" },
    orderBy: { createdAt: "desc" },
  });
}
