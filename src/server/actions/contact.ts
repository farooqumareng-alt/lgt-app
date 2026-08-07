"use server";

import { sendContactFormNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { ContactMessageSchema } from "@/lib/validation/contact";

export type ContactMessageResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

// No login required — same "don't force an account" principle as the
// custom-request lead form. The DB write always happens first and is the
// real source of truth; the email is a best-effort notification on top of
// it, so a Resend hiccup can never lose a customer's message.
export async function submitContactMessage(
  _prevState: ContactMessageResult | undefined,
  formData: FormData,
): Promise<ContactMessageResult> {
  const parsed = ContactMessageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    orderNumber: formData.get("orderNumber"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, orderNumber, message } = parsed.data;

  await prisma.contactMessage.create({
    data: { name, email, orderNumber: orderNumber || null, message },
  });

  try {
    await sendContactFormNotification({ name, email, orderNumber: orderNumber || null, message });
  } catch (error) {
    console.error("sendContactFormNotification failed:", error);
  }

  return { success: true };
}
