import { z } from "zod";

export const ReviewSchema = z.object({
  rating: z.coerce.number({ error: "Rating is required." }).int().min(1, { error: "Pick a rating." }).max(5),
  title: z.string().trim().max(100).optional().or(z.literal("")),
  body: z
    .string()
    .trim()
    .min(10, { error: "Reviews must be at least 10 characters." })
    .max(2000, { error: "Reviews must be under 2000 characters." }),
});
