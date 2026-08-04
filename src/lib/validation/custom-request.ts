import { z } from "zod";

export const CustomRequestSchema = z.object({
  name: z.string().trim().min(2, { error: "Your name is required." }),
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
  phone: z.string().trim().optional().or(z.literal("")),
  productId: z.string().trim().optional().or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(20, { error: "Tell us a bit more — at least 20 characters." })
    .max(4000, { error: "Please keep the description under 4000 characters." }),
  budget: z.string().trim().max(100).optional().or(z.literal("")),
});
