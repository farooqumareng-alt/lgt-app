"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { sendOrderEmailSafely, sendOrderStatusEmail, sendTrackingUpdateEmail } from "@/lib/order-email";
import { buildTrackingUrl } from "@/lib/shipping";
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
