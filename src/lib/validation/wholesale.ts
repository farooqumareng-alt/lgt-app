import { z } from "zod";

export const STORE_TYPES = [
  "Boutique",
  "Western Store",
  "Online Store",
  "Distributor",
  "Gift Shop",
  "Other",
] as const;

export const WholesaleApplicationSchema = z.object({
  businessName: z.string().trim().min(2, { error: "Business name is required." }),
  phone: z.string().trim().min(7, { error: "A phone number is required." }),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  storeType: z.enum(STORE_TYPES, { error: "Select a store type." }),
  // Required going forward — see the schema comment on WholesaleAccount.taxId
  // for why the column itself stays nullable for pre-existing accounts.
  taxId: z.string().trim().min(2, { error: "A resale certificate or tax ID is required to apply." }),
  ein: z.string().trim().max(20).optional().or(z.literal("")),
  addressLine1: z.string().trim().min(1, { error: "Business address is required." }),
  addressLine2: z.string().trim().optional().or(z.literal("")),
  addressCity: z.string().trim().min(1, { error: "City is required." }),
  addressState: z.string().trim().min(2, { error: "State is required." }),
  addressPostalCode: z.string().trim().min(3, { error: "ZIP/postal code is required." }),
  applicationNote: z.string().trim().max(2000).optional().or(z.literal("")),
});

const optionalDecimalField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((val) => (val ? Number(val) : null))
  .refine((val) => val === null || val >= 0, { error: "Must be a positive number." });

const optionalIntField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((val) => (val ? Number(val) : null))
  .refine((val) => val === null || (Number.isInteger(val) && val >= 0), { error: "Must be a whole number." });

// Admin editing an existing account — looser than the applicant-facing
// schema above (storeType/taxId/address may be blank on accounts created
// before those fields existed, and shouldn't be force-required just to save
// an unrelated change), plus the account-terms fields only an admin sets.
export const AdminWholesaleAccountEditSchema = z.object({
  businessName: z.string().trim().min(2, { error: "Business name is required." }),
  phone: z.string().trim().min(7, { error: "A phone number is required." }),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  storeType: z.string().trim().optional().or(z.literal("")),
  taxId: z.string().trim().optional().or(z.literal("")),
  ein: z.string().trim().max(20).optional().or(z.literal("")),
  addressLine1: z.string().trim().optional().or(z.literal("")),
  addressLine2: z.string().trim().optional().or(z.literal("")),
  addressCity: z.string().trim().optional().or(z.literal("")),
  addressState: z.string().trim().optional().or(z.literal("")),
  addressPostalCode: z.string().trim().optional().or(z.literal("")),
  netTermsDays: optionalIntField,
  creditLimit: optionalDecimalField,
  minimumOrderValue: optionalDecimalField,
});
