import "server-only";

import { prisma } from "@/lib/prisma";

export async function createAiActivityLog(data: {
  userId?: string | null;
  type: string;
  title: string;
  input: unknown;
  output: unknown;
}) {
  return prisma.aiActivityLog.create({
    data: {
      userId: data.userId ?? null,
      type: data.type,
      title: data.title,
      input: data.input as any,
      output: data.output as any,
    },
  });
}

export async function getRecentAiActivityLogs(limit = 10) {
  return prisma.aiActivityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
}
