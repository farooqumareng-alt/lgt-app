import { z } from "zod";

import { EmailField } from "@/lib/validation/auth";

export const AddressSchema = z.object({
  label: z.string().trim().max(50).optional().or(z.literal("")),
  fullName: z.string().trim().min(2, { error: "Full name is required." }),
  line1: z.string().trim().min(1, { error: "Address is required." }),
  line2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(1, { error: "City is required." }),
  state: z.string().trim().min(2, { error: "State is required." }),
  postalCode: z.string().trim().min(3, { error: "ZIP/postal code is required." }),
  country: z.string().trim().min(2).default("US"),
  phone: z.string().trim().optional().or(z.literal("")),
});

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters." }),
});

export const ChangeEmailSchema = z.object({
  email: EmailField,
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Current password is required." }),
    newPassword: z
      .string()
      .min(8, { error: "Password must be at least 8 characters." })
      .regex(/[a-zA-Z]/, { error: "Password must contain a letter." })
      .regex(/[0-9]/, { error: "Password must contain a number." }),
  });
