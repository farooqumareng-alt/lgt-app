import "server-only";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { prisma } from "@/lib/prisma";

// Reachable from a real, dedicated public route (not the homepage/root
// layout), so the P2021 defensive-catch discipline used for ContentPage/
// Review isn't strictly required here — applied anyway since it's cheap and
// this is exactly the kind of query that could otherwise take down /blog
// specifically if a migration ever lagged a deploy.

export async function getPublishedBlogPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2021") return [];
    throw error;
  }
}

export async function getPublishedBlogPostBySlug(slug: string) {
  try {
    return await prisma.blogPost.findFirst({ where: { slug, isPublished: true } });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2021") return null;
    throw error;
  }
}
