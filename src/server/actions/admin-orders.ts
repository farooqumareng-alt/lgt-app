"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { sendOrderEmailSafely, sendOrderStatusEmail, sendRefundEmail, sendTrackingUpdateEmail } from "@/lib/order-email";
import { buildTrackingUrl } from "@/lib/shipping";
import { stripe } from "@/lib/stripe";
import type { OrderStatus } from "@/generated/prisma/enums";

export type AdminOrderActionResult = { success: true } | { success: false; message: string };

function recipientEmailOf(order: { guestEmail: string | null; user: { email: string } | null }) {
  return order.user?.email ?? order.guestEmail ?? null;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note: string | undefined,
): Promise<AdminOrderActionResult> {
  await requireRole("ADMIN");

  const extraFields: { shippedAt?: Date; deliveredAt?: Date } = {};
  if (status === "SHIPPED") extraFields.shippedAt = new Date();
  if (status === "DELIVERED") extraFields.deliveredAt = new Date();

  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status, ...extraFields },
      include: { user: { select: { email: true } } },
    });
    await tx.orderStatusEvent.create({
      data: { orderId, status, note: note || null },
    });
    return updated;
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.orderNumber}`);
  revalidatePath(`/account/orders/${order.orderNumber}`);
  revalidatePath(`/wholesale/orders/${order.orderNumber}`);

  const recipientEmail = recipientEmailOf(order);
  if (recipientEmail) {
    await sendOrderEmailSafely(() =>
      sendOrderStatusEmail(recipientEmail, {
        orderNumber: order.orderNumber,
        status: order.status,
        note,
        shippingCarrier: order.shippingCarrier,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
      }),
    );
  }

  return { success: true };
}

const REFUND_REASONS = ["requested_by_customer", "duplicate", "fraudulent"] as const;
type RefundReason = (typeof REFUND_REASONS)[number];

// A real Stripe refund, not a status label change — money actually moves.
// Supports partial refunds (amount is optional; omitted = full remaining
// balance) and is cumulative, so multiple partial refunds on the same order
// can never exceed the original grand total.
export async function refundOrder(
  orderId: string,
  amountDollars: string | undefined,
  reason: string | undefined,
): Promise<AdminOrderActionResult> {
  await requireRole("ADMIN");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { email: true } } },
  });
  if (!order) return { success: false, message: "Order not found." };

  if (!order.stripePaymentIntentId) {
    return {
      success: false,
      message:
        "This order has no direct Stripe payment on file (likely paid via invoice). Issue this refund from the Stripe Dashboard instead.",
    };
  }

  const grandTotal = Number(order.grandTotal);
  const alreadyRefunded = Number(order.amountRefunded ?? 0);
  const remaining = Math.round((grandTotal - alreadyRefunded) * 100) / 100;
  if (remaining <= 0) {
    return { success: false, message: "This order has already been fully refunded." };
  }

  let amount = remaining;
  if (amountDollars && amountDollars.trim()) {
    const parsed = Number(amountDollars);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return { success: false, message: "Enter a valid refund amount." };
    }
    if (parsed > remaining) {
      return { success: false, message: `Refund amount cannot exceed the remaining balance of $${remaining.toFixed(2)}.` };
    }
    amount = parsed;
  }

  const stripeReason = REFUND_REASONS.includes(reason as RefundReason) ? (reason as RefundReason) : undefined;

  let refundId: string;
  try {
    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      amount: Math.round(amount * 100),
      reason: stripeReason,
    });
    refundId = refund.id;
  } catch (error) {
    console.error("Stripe refund failed:", error);
    const message = error instanceof Error ? error.message : "The refund could not be processed by Stripe.";
    return { success: false, message };
  }

  const newAmountRefunded = Math.round((alreadyRefunded + amount) * 100) / 100;
  const isFullRefund = newAmountRefunded >= grandTotal;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        amountRefunded: newAmountRefunded,
        refundedAt: new Date(),
        ...(isFullRefund ? { status: "REFUNDED" as const } : {}),
      },
    });
    await tx.orderStatusEvent.create({
      data: {
        orderId,
        status: isFullRefund ? "REFUNDED" : order.status,
        note: `Refunded $${amount.toFixed(2)} via Stripe (${refundId})${reason ? ` — ${reason.replace(/_/g, " ")}` : ""}`,
      },
    });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.orderNumber}`);
  revalidatePath(`/account/orders/${order.orderNumber}`);
  revalidatePath(`/wholesale/orders/${order.orderNumber}`);

  const recipientEmail = recipientEmailOf(order);
  if (recipientEmail) {
    await sendOrderEmailSafely(() =>
      sendRefundEmail(recipientEmail, {
        orderNumber: order.orderNumber,
        amountRefunded: amount,
        currency: order.currency,
        isFullRefund,
      }),
    );
  }

  return { success: true };
}

export async function setTracking(
  orderId: string,
  carrier: string,
  trackingNumber: string,
): Promise<AdminOrderActionResult> {
  await requireRole("ADMIN");

  if (!carrier || !trackingNumber.trim()) {
    return { success: false, message: "Carrier and tracking number are required." };
  }

  const trackingUrl = buildTrackingUrl(carrier, trackingNumber.trim());

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { shippingCarrier: carrier, trackingNumber: trackingNumber.trim(), trackingUrl },
    include: { user: { select: { email: true } } },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.orderNumber}`);
  revalidatePath(`/account/orders/${order.orderNumber}`);
  revalidatePath(`/wholesale/orders/${order.orderNumber}`);

  const recipientEmail = recipientEmailOf(order);
  if (recipientEmail) {
    await sendOrderEmailSafely(() =>
      sendTrackingUpdateEmail(recipientEmail, {
        orderNumber: order.orderNumber,
        shippingCarrier: carrier,
        trackingNumber: trackingNumber.trim(),
        trackingUrl,
      }),
    );
  }

  return { success: true };
}
