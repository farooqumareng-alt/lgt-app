import "server-only";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { prisma } from "@/lib/prisma";

export function getAllContentPagesForAdmin() {
  return prisma.contentPage.findMany({ orderBy: { title: "asc" } });
}

export function getContentPageForEdit(id: string) {
  return prisma.contentPage.findUnique({ where: { id } });
}

/**
 * Called from the [slug] route, and (via getFooterContentPages) from the
 * retail root layout — meaning it runs on effectively every retail page,
 * including during `next build`'s page-data-collection step, which invokes
 * layouts even for routes not being statically prerendered. Confirmed
 * directly: this took the production build down entirely (not just a
 * runtime 500) the moment ContentPage's migration lagged the code — same
 * "relation does not exist" shape as the AiActivityLog incident, but this
 * time at build time. Same fix: catch P2021 and degrade gracefully rather
 * than trust the migration is always applied by the time this runs.
 */
export async function getContentPageBySlug(slug: string) {
  try {
    return await prisma.contentPage.findUnique({ where: { slug } });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2021") {
      return null;
    }
    throw error;
  }
}

export async function getFooterContentPages() {
  try {
    return await prisma.contentPage.findMany({
      where: { showInFooter: true },
      select: { slug: true, title: true },
      orderBy: { title: "asc" },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2021") {
      return [];
    }
    throw error;
  }
}
