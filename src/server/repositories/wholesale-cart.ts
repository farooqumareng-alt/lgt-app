import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireApprovedWholesaler } from "@/lib/dal";
import { resolveWholesaleUnitPrice } from "@/server/services/pricing-service";

const cartInclude = {
  items: {
    include: {
      productVariant: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      },
    },
  },
} as const;

export type WholesaleCartWithItems = NonNullable<Awaited<ReturnType<typeof getOrCreateWholesaleCart>>>;

export async function cartItemDtos(cart: WholesaleCartWithItems) {
  return Promise.all(
    cart.items.map(async (item) => {
      const variant = item.productVariant;
      const product = variant.product;
      const label = [variant.color, variant.size].filter(Boolean).join(" / ") || null;
      const unitPrice = (await resolveWholesaleUnitPrice(variant, item.quantity)) ?? 0;

      return {
        id: item.id,
        productVariantId: variant.id,
        quantity: item.quantity,
        name: product.name,
        slug: product.slug,
        variantLabel: label,
        unitPrice,
        stockQuantity: variant.stockQuantity,
        image: product.images[0] ?? null,
      };
    }),
  );
}

export async function getWholesaleCart() {
  const { session } = await requireApprovedWholesaler();
  return prisma.cart.findUnique({
    where: { userId_channel: { userId: session.user.id, channel: "WHOLESALE" } },
    include: cartInclude,
  });
}

export async function getOrCreateWholesaleCart() {
  const { session } = await requireApprovedWholesaler();
  return prisma.cart.upsert({
    where: { userId_channel: { userId: session.user.id, channel: "WHOLESALE" } },
    update: {},
    create: { userId: session.user.id, channel: "WHOLESALE" },
    include: cartInclude,
  });
}

/**
 * Read-only, never redirects — safe to call from the header on public
 * wholesale pages (landing/apply/pending) that unapproved visitors can see.
 */
export async function getWholesaleCartItemCount() {
  const session = await auth();
  if (!session?.user) return 0;

  const cart = await prisma.cart.findUnique({
    where: { userId_channel: { userId: session.user.id, channel: "WHOLESALE" } },
    include: { items: { select: { quantity: true } } },
  });
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}
