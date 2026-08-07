import { z } from "zod";

import { EmailField } from "@/lib/validation/auth";

export const ContactMessageSchema = z.object({
  name: z.string().trim().min(2, { error: "Name is required." }),
  email: EmailField,
  orderNumber: z.string().trim().max(50).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, { error: "Tell us a bit more — at least 10 characters." })
    .max(2000, { error: "Message must be under 2000 characters." }),
});
