"use server";

import { put } from "@vercel/blob";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomRequestSchema } from "@/lib/validation/custom-request";

export type CustomRequestActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

// No login required — a lead-intake form, same "don't force an account"
// principle as guest checkout. If the visitor is signed in we still link the
// request to their userId so it shows up if they later view their account.
export async function submitCustomRequest(
  _prevState: CustomRequestActionResult | undefined,
  formData: FormData,
): Promise<CustomRequestActionResult> {
  const parsed = CustomRequestSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    productId: formData.get("productId"),
    description: formData.get("description"),
    budget: formData.get("budget"),
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const session = await auth();
  const { name, email, phone, productId, description, budget } = parsed.data;

  let referenceImageUrl: string | null = null;
  let referenceImageAlt: string | null = null;
  const file = formData.get("referenceImage");
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      return { success: false, message: "Reference file must be an image." };
    }
    if (file.size > 8 * 1024 * 1024) {
      return { success: false, message: "Reference image must be under 8MB." };
    }
    const blob = await put(`custom-requests/${Date.now()}-${file.name}`, file, { access: "public" });
    referenceImageUrl = blob.url;
    referenceImageAlt = `Reference image from ${name}`;
  }

  let validProductId: string | null = null;
  if (productId) {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    validProductId = product?.id ?? null;
  }

  await prisma.customRequest.create({
    data: {
      userId: session?.user?.id ?? null,
      name,
      email,
      phone: phone || null,
      productId: validProductId,
      description,
      budget: budget || null,
      referenceImageUrl,
      referenceImageAlt,
    },
  });

  return { success: true };
}
