import "server-only";
import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GUEST_CART_COOKIE = "guest_cart_token";

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

export type CartWithItems = NonNullable<Awaited<ReturnType<typeof getOrCreateCart>>>;

function resolveVariantPrice(variant: { priceRetailOverride: unknown; product: { basePriceRetail: unknown } }) {
  return Number(variant.priceRetailOverride ?? variant.product.basePriceRetail);
}

export function cartItemDto(item: CartWithItems["items"][number]) {
  const variant = item.productVariant;
  const product = variant.product;
  const label = [variant.color, variant.size].filter(Boolean).join(" / ") || null;

  return {
    id: item.id,
    productVariantId: variant.id,
    quantity: item.quantity,
    name: product.name,
    slug: product.slug,
    variantLabel: label,
    unitPrice: resolveVariantPrice(variant),
    stockQuantity: variant.stockQuantity,
    image: product.images[0] ?? null,
  };
}

/**
 * Read-only cart resolution for Server Components (pages, header). Never writes
 * cookies — Next.js disallows that outside Server Actions/Route Handlers. If a
 * logged-in user has no cart yet but a guest cart cookie exists, its contents are
 * shown for continuity; the actual DB reassignment happens on the next
 * cart-mutating Server Action (see `getOrCreateCart`).
 */
export async function getCart() {
  const session = await auth();
  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_CART_COOKIE)?.value;

  if (session?.user) {
    const userCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: cartInclude,
    });
    if (userCart && userCart.items.length > 0) return userCart;
    if (guestToken) {
      const guestCart = await prisma.cart.findUnique({ where: { guestToken }, include: cartInclude });
      if (guestCart) return guestCart;
    }
    return userCart;
  }

  if (!guestToken) return null;
  return prisma.cart.findUnique({ where: { guestToken }, include: cartInclude });
}

async function claimGuestCart(userId: string, guestToken: string) {
  const guestCart = await prisma.cart.findUnique({ where: { guestToken }, include: { items: true } });
  if (!guestCart) return;

  const userCart = await prisma.cart.findUnique({ where: { userId } });

  if (!userCart) {
    await prisma.cart.update({ where: { id: guestCart.id }, data: { userId, guestToken: null } });
    return;
  }

  for (const item of guestCart.items) {
    await prisma.cartItem.upsert({
      where: { cartId_productVariantId: { cartId: userCart.id, productVariantId: item.productVariantId } },
      update: { quantity: { increment: item.quantity } },
      create: {
        cartId: userCart.id,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      },
    });
  }
  await prisma.cart.delete({ where: { id: guestCart.id } });
}

/**
 * Writable cart resolution — Server Actions only. Creates the cart (and the guest
 * cookie, if needed) and claims any leftover guest cart once a user is logged in.
 */
export async function getOrCreateCart() {
  const session = await auth();
  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_CART_COOKIE)?.value;

  if (session?.user) {
    if (guestToken) {
      await claimGuestCart(session.user.id, guestToken);
      cookieStore.delete(GUEST_CART_COOKIE);
    }
    return prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
      include: cartInclude,
    });
  }

  if (guestToken) {
    const existing = await prisma.cart.findUnique({ where: { guestToken }, include: cartInclude });
    if (existing) return existing;
  }

  const newToken = crypto.randomUUID();
  const cart = await prisma.cart.create({ data: { guestToken: newToken }, include: cartInclude });
  cookieStore.set(GUEST_CART_COOKIE, newToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return cart;
}
