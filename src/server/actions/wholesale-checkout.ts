"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import type Stripe from "stripe";

import { requireApprovedWholesaler } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendOrderEmailSafely } from "@/lib/order-email";
import { stripe } from "@/lib/stripe";
import { resolveWholesaleUnitPrice } from "@/server/services/pricing-service";
import { getOrCreateWholesaleCart } from "@/server/repositories/wholesale-cart";

const SITE_URL = process.env.AUTH_URL ?? "http://localhost:3000";

// v1 placeholder — real freight-rate integration (like retail's carrier rates) is a
// later add-on, not launch-blocking, matching how retail shipping started as flat presets.
const WHOLESALE_FREIGHT_CENTS = 5000;

async function resolveCartLines(cart: Awaited<ReturnType<typeof getOrCreateWholesaleCart>>) {
  if (cart.items.length === 0) {
    redirect("/wholesale/cart");
  }

  const lines = await Promise.all(
    cart.items.map(async (item) => {
      const variant = item.productVariant;
      if (!variant.isActive || item.quantity > variant.stockQuantity) {
        redirect("/wholesale/cart?error=stock");
      }
      const unitPrice = await resolveWholesaleUnitPrice(variant, item.quantity);
      if (unitPrice === null) {
        redirect("/wholesale/cart?error=stock");
      }
      const variantLabel = [variant.color, variant.size].filter(Boolean).join(" / ") || null;
      return {
        productVariantId: variant.id,
        productNameSnapshot: variant.product.name,
        variantLabelSnapshot: variantLabel,
        skuSnapshot: variant.sku,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    }),
  );

  return lines;
}

function checkMinimumOrderValue(subtotal: number, minimumOrderValue: unknown) {
  if (minimumOrderValue === null || minimumOrderValue === undefined) return;
  if (subtotal < Number(minimumOrderValue)) {
    redirect(`/wholesale/cart?error=minimum&min=${Number(minimumOrderValue)}`);
  }
}

export async function createWholesaleCheckoutSession() {
  const { session, wholesaleAccount } = await requireApprovedWholesaler();
  const cart = await getOrCreateWholesaleCart();
  const lines = await resolveCartLines(cart);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  checkMinimumOrderValue(subtotal, wholesaleAccount.minimumOrderValue);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map((line) => ({
    quantity: line.quantity,
    price_data: {
      currency: "usd",
      unit_amount: Math.round(line.unitPrice * 100),
      product_data: {
        name: line.variantLabelSnapshot
          ? `${line.productNameSnapshot} (${line.variantLabelSnapshot})`
          : line.productNameSnapshot,
      },
    },
  }));

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: WHOLESALE_FREIGHT_CENTS, currency: "usd" },
            display_name: "Standard Freight",
          },
        },
      ],
      automatic_tax: { enabled: true },
      customer_email: session.user.email ?? undefined,
      success_url: `${SITE_URL}/wholesale/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/wholesale/checkout`,
      metadata: {
        cartId: cart.id,
        userId: session.user.id,
        wholesaleAccountId: wholesaleAccount.id,
      },
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    redirect(checkoutSession.url);
  } catch (error) {
    unstable_rethrow(error);
    console.error("createWholesaleCheckoutSession failed:", error);
    redirect("/wholesale/checkout?error=1");
  }
}

export async function createWholesaleInvoiceOrder() {
  const { session, wholesaleAccount } = await requireApprovedWholesaler();
  if (!wholesaleAccount.netTermsDays) {
    redirect("/wholesale/checkout?error=1");
  }

  const cart = await getOrCreateWholesaleCart();
  const lines = await resolveCartLines(cart);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  checkMinimumOrderValue(subtotal, wholesaleAccount.minimumOrderValue);

  try {
    let stripeCustomerId = wholesaleAccount.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email ?? undefined,
        name: wholesaleAccount.businessName,
        metadata: { wholesaleAccountId: wholesaleAccount.id },
      });
      stripeCustomerId = customer.id;
      await prisma.wholesaleAccount.update({
        where: { id: wholesaleAccount.id },
        data: { stripeCustomerId },
      });
    }

    for (const line of lines) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        currency: "usd",
        amount: Math.round(line.lineTotal * 100),
        description: line.variantLabelSnapshot
          ? `${line.productNameSnapshot} (${line.variantLabelSnapshot}) x${line.quantity}`
          : `${line.productNameSnapshot} x${line.quantity}`,
      });
    }
    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      currency: "usd",
      amount: WHOLESALE_FREIGHT_CENTS,
      description: "Standard Freight",
    });

    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: "send_invoice",
      days_until_due: wholesaleAccount.netTermsDays,
      auto_advance: true,
      pending_invoice_items_behavior: "include",
      metadata: { cartId: cart.id, wholesaleAccountId: wholesaleAccount.id },
    });

    const shippingTotal = WHOLESALE_FREIGHT_CENTS / 100;

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: invoice.id!, // temporary unique placeholder, replaced below
          userId: session.user.id,
          status: "INVOICED",
          channel: "WHOLESALE",
          paymentMethod: "INVOICE",
          wholesaleAccountId: wholesaleAccount.id,
          subtotal,
          shippingTotal,
          taxTotal: 0, // backfilled from the invoice's actual tax once paid (see webhook)
          grandTotal: subtotal + shippingTotal,
          currency: "USD",
          shippingAddress: {},
          stripeInvoiceId: invoice.id,
          items: {
            create: lines.map((line) => ({
              productVariantId: line.productVariantId,
              productNameSnapshot: line.productNameSnapshot,
              variantLabelSnapshot: line.variantLabelSnapshot,
              skuSnapshot: line.skuSnapshot,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              lineTotal: line.lineTotal,
            })),
          },
          statusHistory: {
            create: { status: "INVOICED", note: `Invoiced under Net ${wholesaleAccount.netTermsDays} terms` },
          },
        },
      });

      await tx.order.update({
        where: { id: created.id },
        data: { orderNumber: `LGT-${100000 + created.orderSequence}` },
      });

      for (const line of lines) {
        await tx.productVariant.update({
          where: { id: line.productVariantId },
          data: { stockQuantity: { decrement: line.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    if (session.user.email) {
      await sendOrderEmailSafely(() =>
        sendOrderConfirmationEmail(session.user.email!, {
          orderNumber: order.orderNumber,
          grandTotal: Number(order.grandTotal),
          currency: order.currency,
          items: lines,
          paymentMethod: "INVOICE",
        }),
      );
    }

    redirect(`/wholesale/checkout/success?order=${order.orderNumber}`);
  } catch (error) {
    unstable_rethrow(error);
    console.error("createWholesaleInvoiceOrder failed:", error);
    redirect("/wholesale/checkout?error=1");
  }
}
