import "server-only";

import { prisma } from "@/lib/prisma";

export function getAllBlogPostsForAdmin() {
  return prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
}

export function getBlogPostForEdit(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}
