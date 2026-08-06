import "server-only";

import { Resend } from "resend";

import type { OrderStatus } from "@/generated/prisma/enums";

// Lazy, same principle as src/lib/stripe.ts and src/lib/email.ts — Next's
// build-time page-data collection imports every route; constructing this
// eagerly would fail the whole build if RESEND_API_KEY were missing at that
// moment, even though no request had happened yet.
let client: Resend | undefined;

function getClient(): Resend {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Leather Goods Texas <onboarding@resend.dev>";

// Order/shipping emails are a nice-to-have on top of a payment that already
// succeeded — a Resend hiccup must never surface as a failed checkout, a
// failed admin status update, or a failed webhook (which Stripe would then
// retry indefinitely). Every call site wraps its send in this instead of a
// bare await, matching the "recover gracefully, never fail silently — but
// don't let a non-critical failure take down a critical path" principle.
export async function sendOrderEmailSafely(send: () => Promise<unknown>): Promise<void> {
  try {
    await send();
  } catch (error) {
    console.error("Order email failed to send:", error);
  }
}

type EmailItem = { productNameSnapshot: string; variantLabelSnapshot: string | null; quantity: number; lineTotal: number };

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function emailShell(title: string, bodyHtml: string) {
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #2B2320;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="margin: 32px 0 0; font-size: 13px; color: #2B2320; opacity: 0.6;">
        Leather Goods Texas — questions about your order? Just reply to this email.
      </p>
    </div>
  `;
}

function itemsListHtml(items: EmailItem[], currency: string) {
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 0 0 20px;">
      ${items
        .map(
          (item) => `
        <tr style="border-bottom: 1px solid #eee6da;">
          <td style="padding: 8px 0; font-size: 14px;">
            ${item.productNameSnapshot}${item.variantLabelSnapshot ? ` (${item.variantLabelSnapshot})` : ""} × ${item.quantity}
          </td>
          <td style="padding: 8px 0; font-size: 14px; text-align: right; white-space: nowrap;">
            ${formatCurrency(item.lineTotal, currency)}
          </td>
        </tr>`,
        )
        .join("")}
    </table>
  `;
}

export async function sendOrderConfirmationEmail(
  to: string,
  order: { orderNumber: string; grandTotal: number; currency: string; items: EmailItem[]; paymentMethod: "CARD" | "INVOICE" },
) {
  const paidLine =
    order.paymentMethod === "INVOICE"
      ? "This order has been placed and invoiced under your net terms — no payment is due right now."
      : "Payment received — thank you!";

  await getClient().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Order ${order.orderNumber} confirmed — Leather Goods Texas`,
    html: emailShell(
      "Order confirmed",
      `
        <p style="margin: 0 0 8px; opacity: 0.8;">Order <strong>${order.orderNumber}</strong></p>
        <p style="margin: 0 0 20px; opacity: 0.8;">${paidLine}</p>
        ${itemsListHtml(order.items, order.currency)}
        <p style="margin: 0; font-size: 15px; font-weight: bold; text-align: right;">
          Total: ${formatCurrency(order.grandTotal, order.currency)}
        </p>
      `,
    ),
  });
}

const STATUS_COPY: Record<OrderStatus, { subject: string; headline: string; body: string }> = {
  INVOICED: {
    subject: "Order invoiced",
    headline: "Order invoiced",
    body: "Your order has been placed and invoiced under your net terms.",
  },
  PAID: {
    subject: "Payment received",
    headline: "Payment received",
    body: "We've received payment for your order and are getting it ready.",
  },
  PROCESSING: {
    subject: "Order is being prepared",
    headline: "Your order is being prepared",
    body: "Your order is now being cut, stitched, and packed by hand.",
  },
  SHIPPED: {
    subject: "Order has shipped",
    headline: "Your order is on its way",
    body: "Your order has shipped.",
  },
  DELIVERED: {
    subject: "Order delivered",
    headline: "Your order was delivered",
    body: "Your order has been marked as delivered. We hope you love it.",
  },
  CANCELLED: {
    subject: "Order cancelled",
    headline: "Order cancelled",
    body: "Your order has been cancelled. If this is unexpected, just reply to this email.",
  },
  REFUNDED: {
    subject: "Order refunded",
    headline: "Order refunded",
    body: "Your order has been refunded. Please allow a few business days for it to appear on your statement.",
  },
};

export async function sendOrderStatusEmail(
  to: string,
  order: {
    orderNumber: string;
    status: OrderStatus;
    note?: string | null;
    shippingCarrier?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
  },
) {
  const copy = STATUS_COPY[order.status];
  const trackingHtml =
    order.status === "SHIPPED" && order.trackingNumber
      ? `
        <p style="margin: 16px 0 0; font-size: 14px;">
          <strong>${order.shippingCarrier ?? "Carrier"} tracking:</strong>
          ${order.trackingUrl ? `<a href="${order.trackingUrl}" style="color: #8f652f;">${order.trackingNumber}</a>` : order.trackingNumber}
        </p>
      `
      : "";

  await getClient().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${copy.subject} — Order ${order.orderNumber}`,
    html: emailShell(
      copy.headline,
      `
        <p style="margin: 0 0 8px; opacity: 0.8;">Order <strong>${order.orderNumber}</strong></p>
        <p style="margin: 0; opacity: 0.8;">${copy.body}</p>
        ${order.note ? `<p style="margin: 12px 0 0; font-size: 14px; opacity: 0.7;">${order.note}</p>` : ""}
        ${trackingHtml}
      `,
    ),
  });
}

export async function sendTrackingUpdateEmail(
  to: string,
  order: { orderNumber: string; shippingCarrier: string; trackingNumber: string; trackingUrl: string | null },
) {
  await getClient().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Tracking added — Order ${order.orderNumber}`,
    html: emailShell(
      "Tracking information added",
      `
        <p style="margin: 0 0 8px; opacity: 0.8;">Order <strong>${order.orderNumber}</strong></p>
        <p style="margin: 16px 0 0; font-size: 14px;">
          <strong>${order.shippingCarrier} tracking:</strong>
          ${order.trackingUrl ? `<a href="${order.trackingUrl}" style="color: #8f652f;">${order.trackingNumber}</a>` : order.trackingNumber}
        </p>
      `,
    ),
  });
}
