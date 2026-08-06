import "server-only";

import { prisma } from "@/lib/prisma";

export function getAllContentPagesForAdmin() {
  return prisma.contentPage.findMany({ orderBy: { title: "asc" } });
}

export function getContentPageForEdit(id: string) {
  return prisma.contentPage.findUnique({ where: { id } });
}

export function getContentPageBySlug(slug: string) {
  return prisma.contentPage.findUnique({ where: { slug } });
}

export function getFooterContentPages() {
  return prisma.contentPage.findMany({
    where: { showInFooter: true },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });
}
