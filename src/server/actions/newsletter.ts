"use server";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

import { prisma } from "@/lib/prisma";
import { NewsletterSignupSchema } from "@/lib/validation/newsletter";

export type NewsletterSignupResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; message?: string };

// No login required — a public marketing capture form, same "don't force an
// account" principle as the custom-request lead form. Re-subscribing with an
// email already on file is treated as a quiet success, not an error — the
// visitor doesn't need to know (or care) that the row already existed.
export async function subscribeToNewsletter(
  _prevState: NewsletterSignupResult | undefined,
  formData: FormData,
): Promise<NewsletterSignupResult> {
  const parsed = NewsletterSignupSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email: parsed.data.email } });
  } catch (error) {
    const isDuplicateEmail = error instanceof PrismaClientKnownRequestError && error.code === "P2002";
    if (!isDuplicateEmail) throw error;
  }

  return { success: true };
}
