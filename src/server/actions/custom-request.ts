"use server";

import { put } from "@vercel/blob";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomRequestSchema } from "@/lib/validation/custom-request";

export type CustomRequestActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

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

  const files = formData.getAll("referenceImages").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_IMAGES) {
    return { success: false, message: `Please attach at most ${MAX_IMAGES} images.` };
  }
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return { success: false, message: "Reference files must be images." };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { success: false, message: "Each reference image must be under 8MB." };
    }
  }

  // Upload after validation passes for every file — never partially upload
  // then fail, which would leave orphaned blobs with no DB row pointing at them.
  const uploaded = await Promise.all(
    files.map((file) => put(`custom-requests/${Date.now()}-${file.name}`, file, { access: "public" })),
  );

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
      images: {
        create: uploaded.map((blob, index) => ({
          url: blob.url,
          altText: `Reference image ${index + 1} from ${name}`,
          sortOrder: index,
        })),
      },
    },
  });

  return { success: true };
}
