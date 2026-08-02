import "server-only";

import { prisma } from "@/lib/prisma";

type PriceableVariant = {
  priceWholesaleOverride: unknown;
  product: { id: string; basePriceWholesale: unknown };
};

/**
 * Resolves the wholesale unit price for a variant at a given order quantity —
 * always live from the DB, never trusted from the client. Returns null if the
 * variant isn't wholesale-enabled (no basePriceWholesale/override set).
 */
export async function resolveWholesaleUnitPrice(
  variant: PriceableVariant,
  quantity: number,
): Promise<number | null> {
  const base = variant.priceWholesaleOverride ?? variant.product.basePriceWholesale;
  if (base === null || base === undefined) return null;

  const baseNum = Number(base);

  const priceBreaks = await prisma.wholesalePriceBreak.findMany({
    where: { productId: variant.product.id, minQuantity: { lte: quantity } },
    orderBy: { minQuantity: "desc" },
    take: 1,
  });

  const breakPrice = priceBreaks[0] ? Number(priceBreaks[0].price) : null;
  if (breakPrice !== null && breakPrice < baseNum) return breakPrice;
  return baseNum;
}
