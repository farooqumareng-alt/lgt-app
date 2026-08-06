import "server-only";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function createAiActivityLog(data: {
  userId?: string | null;
  type: string;
  title: string;
  input: Prisma.InputJsonValue;
  output: Prisma.InputJsonValue;
}) {
  return prisma.aiActivityLog.create({
    data: {
      userId: data.userId ?? null,
      type: data.type,
      title: data.title,
      input: data.input,
      output: data.output,
    },
  });
}

export async function getRecentAiActivityLogs(limit = 10) {
  try {
    return await prisma.aiActivityLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2021") {
      console.warn("AiActivityLog table is not available yet. Returning empty activity log list.", error);
      return [];
    }

    console.error("Failed to load AI activity logs:", error);
    throw error;
  }
}
