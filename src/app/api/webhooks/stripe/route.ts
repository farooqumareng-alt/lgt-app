import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendOrderEmailSafely, sendOrderStatusEmail } from "@/lib/order-email";
import { stripe } from "@/lib/stripe";
import { resolveWholesaleUnitPrice } from "@/server/services/pricing-service";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutSessionCompleted(event.data.object);
  } else if (event.type === "invoice.paid") {
    await handleInvoicePaid(event.data.object);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const existing = await prisma.order.findUnique({
    where: { stripeCheckoutSessionId: session.id },
  });
  if (existing) return; // already processed — safe no-op for a retried delivery

  const cartId = session.metadata?.cartId;
  if (!cartId) {
    console.error("checkout.session.completed missing cartId metadata", session.id);
    return;
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { productVariant: { include: { product: true } } } } },
  });

  if (!cart || cart.items.length === 0) {
    console.error("Cart not found or empty for completed checkout session", session.id, cartId);
    return;
  }

  const wholesaleAccountId = session.metadata?.wholesaleAccountId || null;

  const shippingAddress =
    session.collected_information?.shipping_details ?? session.customer_details ?? {};

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

  const itemsData = await Promise.all(
    cart.items.map(async (item) => {
      const variant = item.productVariant;
      const product = variant.product;
      const unitPrice = wholesaleAccountId
        ? ((await resolveWholesaleUnitPrice(variant, item.quantity)) ?? 0)
        : Number(variant.priceRetailOverride ?? product.basePriceRetail);
      const variantLabel = [variant.color, variant.size].filter(Boolean).join(" / ") || null;

      return {
        productVariantId: variant.id,
        productNameSnapshot: product.name,
        variantLabelSnapshot: variantLabel,
        skuSnapshot: variant.sku,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    }),
  );

  const { orderNumber, grandTotal, currency } = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: session.id, // temporary unique placeholder, replaced below
        userId: session.metadata?.userId || null,
        guestEmail: session.metadata?.userId ? null : (session.customer_details?.email ?? null),
        channel: wholesaleAccountId ? "WHOLESALE" : "RETAIL",
        paymentMethod: "CARD",
        wholesaleAccountId,
        subtotal: (session.amount_subtotal ?? 0) / 100,
        shippingTotal: (session.shipping_cost?.amount_total ?? 0) / 100,
        taxTotal: (session.total_details?.amount_tax ?? 0) / 100,
        grandTotal: (session.amount_total ?? 0) / 100,
        currency: (session.currency ?? "usd").toUpperCase(),
        shippingAddress,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        items: { create: itemsData },
        statusHistory: {
          create: { status: "PAID", note: "Payment received via Stripe Checkout" },
        },
      },
    });

    const finalOrderNumber = `LGT-${100000 + order.orderSequence}`;
    await tx.order.update({
      where: { id: order.id },
      data: { orderNumber: finalOrderNumber },
    });

    for (const item of cart.items) {
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { orderNumber: finalOrderNumber, grandTotal: Number(order.grandTotal), currency: order.currency };
  });

  const recipientEmail = session.customer_details?.email;
  if (recipientEmail) {
    await sendOrderEmailSafely(() =>
      sendOrderConfirmationEmail(recipientEmail, {
        orderNumber,
        grandTotal,
        currency,
        items: itemsData,
        paymentMethod: "CARD",
      }),
    );
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const order = await prisma.order.findUnique({
    where: { stripeInvoiceId: invoice.id },
    include: { user: { select: { email: true } } },
  });
  if (!order) return; // not one of our wholesale invoice orders
  if (order.status === "PAID") return; // already processed — safe no-op for a retried delivery

  const grandTotal = (invoice.amount_paid ?? invoice.total ?? 0) / 100;
  const taxTotal = (invoice.total_taxes ?? []).reduce((sum, t) => sum + t.amount, 0) / 100;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID", taxTotal, grandTotal },
    }),
    prisma.orderStatusEvent.create({
      data: { orderId: order.id, status: "PAID", note: "Invoice paid" },
    }),
  ]);

  if (order.user?.email) {
    await sendOrderEmailSafely(() =>
      sendOrderStatusEmail(order.user!.email!, { orderNumber: order.orderNumber, status: "PAID" }),
    );
  }
}
