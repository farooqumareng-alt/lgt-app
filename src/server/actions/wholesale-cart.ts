"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireApprovedWholesaler } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getOrCreateWholesaleCart } from "@/server/repositories/wholesale-cart";
import { getOrderDetail } from "@/server/repositories/orders";

export type WholesaleCartActionResult = { success: true } | { success: false; error: string };
export type BulkAddResult =
  | { success: true; addedCount: number }
  | { success: false; error: string; skippedSkus?: string[] };

async function addOneToWholesaleCart(cartId: string, productVariantId: string, quantity: number) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: productVariantId },
    include: { product: true },
  });
  if (!variant || !variant.isActive || variant.product.basePriceWholesale === null) return false;

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productVariantId: { cartId, productVariantId } },
  });
  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if (nextQuantity > variant.stockQuantity) return false;

  await prisma.cartItem.upsert({
    where: { cartId_productVariantId: { cartId, productVariantId } },
    update: { quantity: nextQuantity },
    create: { cartId, productVariantId, quantity: nextQuantity - (existing?.quantity ?? 0) },
  });
  return true;
}

export async function addToWholesaleCart(
  productVariantId: string,
  quantity: number = 1,
): Promise<WholesaleCartActionResult> {
  const cart = await getOrCreateWholesaleCart();
  const ok = await addOneToWholesaleCart(cart.id, productVariantId, quantity);
  if (!ok) return { success: false, error: "Not enough stock available, or item isn't wholesale-enabled." };

  revalidatePath("/wholesale", "layout");
  return { success: true };
}

export async function updateWholesaleCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<WholesaleCartActionResult> {
  if (quantity < 1) {
    return removeWholesaleCartItem(cartItemId);
  }

  const cart = await getOrCreateWholesaleCart();
  const item = cart.items.find((i) => i.id === cartItemId);
  if (!item) {
    return { success: false, error: "Item not found in cart." };
  }
  if (quantity > item.productVariant.stockQuantity) {
    return { success: false, error: "Not enough stock available." };
  }

  await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  revalidatePath("/wholesale", "layout");
  return { success: true };
}

export async function removeWholesaleCartItem(cartItemId: string): Promise<WholesaleCartActionResult> {
  const cart = await getOrCreateWholesaleCart();
  const item = cart.items.find((i) => i.id === cartItemId);
  if (!item) {
    return { success: false, error: "Item not found in cart." };
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/wholesale", "layout");
  return { success: true };
}

/** Shared by the CSV-upload form and the multi-row quantity grid — each row is {sku, quantity}. */
export async function bulkAddToWholesaleCart(rows: { sku: string; quantity: number }[]): Promise<BulkAddResult> {
  const validRows = rows.filter((r) => r.sku && r.quantity > 0);
  if (validRows.length === 0) {
    return { success: false, error: "No valid rows to add." };
  }

  const cart = await getOrCreateWholesaleCart();
  const variants = await prisma.productVariant.findMany({
    where: { sku: { in: validRows.map((r) => r.sku) }, isActive: true, product: { basePriceWholesale: { not: null } } },
    include: { product: true },
  });
  const variantBySku = new Map(variants.map((v) => [v.sku, v]));

  let addedCount = 0;
  const skippedSkus: string[] = [];

  for (const row of validRows) {
    const variant = variantBySku.get(row.sku);
    if (!variant) {
      skippedSkus.push(row.sku);
      continue;
    }
    const ok = await addOneToWholesaleCart(cart.id, variant.id, row.quantity);
    if (ok) addedCount++;
    else skippedSkus.push(row.sku);
  }

  revalidatePath("/wholesale", "layout");

  if (addedCount === 0) {
    return { success: false, error: "None of the rows could be added — check SKUs and stock.", skippedSkus };
  }
  return { success: true, addedCount };
}

// Rebuilds cart lines from a past order's real snapshotted items (by SKU),
// re-validating current stock/active/wholesale-enabled status the same way
// bulkAddToWholesaleCart already does for CSV/grid input — a reorder is
// just another source of {sku, quantity} rows, never a shortcut around
// those checks.
export async function reorderWholesaleOrder(orderNumber: string) {
  const { session } = await requireApprovedWholesaler();
  const order = await getOrderDetail(session.user.id, orderNumber);

  if (!order || order.channel !== "WHOLESALE") {
    redirect(`/wholesale/orders/${orderNumber}?reorder=notfound`);
  }

  const rows = order.items.map((item) => ({ sku: item.skuSnapshot, quantity: item.quantity }));
  const result = await bulkAddToWholesaleCart(rows);

  if (!result.success) {
    redirect(`/wholesale/orders/${orderNumber}?reorder=failed`);
  }
  if (result.addedCount < rows.length) {
    redirect(`/wholesale/cart?reordered=partial&count=${result.addedCount}&of=${rows.length}`);
  }
  redirect(`/wholesale/cart?reordered=full&count=${result.addedCount}`);
}
