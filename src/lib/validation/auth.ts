import { z } from "zod";

// Normalize before validating format — email lookups/uniqueness are case-insensitive
// in practice, so two accounts that only differ by letter case must not be possible.
export const EmailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }));

export const LoginSchema = z.object({
  email: EmailField,
  password: z.string().min(1, { error: "Password is required." }),
});

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters." }),
  email: EmailField,
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." })
    .regex(/[a-zA-Z]/, { error: "Password must contain a letter." })
    .regex(/[0-9]/, { error: "Password must contain a number." }),
});
