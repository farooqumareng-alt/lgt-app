"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/server/repositories/cart";

export type CartActionResult = { success: true } | { success: false; error: string };

export async function addToCart(
  productVariantId: string,
  quantity: number = 1,
): Promise<CartActionResult> {
  const variant = await prisma.productVariant.findUnique({ where: { id: productVariantId } });
  if (!variant || !variant.isActive) {
    return { success: false, error: "This item is no longer available." };
  }
  if (variant.stockQuantity < quantity) {
    return { success: false, error: "Not enough stock available." };
  }

  const cart = await getOrCreateCart();

  const existing = cart.items.find((item) => item.productVariantId === productVariantId);
  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if (nextQuantity > variant.stockQuantity) {
    return { success: false, error: "Not enough stock available." };
  }

  await prisma.cartItem.upsert({
    where: { cartId_productVariantId: { cartId: cart.id, productVariantId } },
    update: { quantity: nextQuantity },
    create: { cartId: cart.id, productVariantId, quantity },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<CartActionResult> {
  if (quantity < 1) {
    return removeCartItem(cartItemId);
  }

  const cart = await getOrCreateCart();
  const item = cart.items.find((i) => i.id === cartItemId);
  if (!item) {
    return { success: false, error: "Item not found in cart." };
  }
  if (quantity > item.productVariant.stockQuantity) {
    return { success: false, error: "Not enough stock available." };
  }

  await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeCartItem(cartItemId: string): Promise<CartActionResult> {
  const cart = await getOrCreateCart();
  const item = cart.items.find((i) => i.id === cartItemId);
  if (!item) {
    return { success: false, error: "Item not found in cart." };
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/", "layout");
  return { success: true };
}
