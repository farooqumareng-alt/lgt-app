import { z } from "zod";

import { EmailField } from "@/lib/validation/auth";

export const AdminCustomerEditSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters." }),
  email: EmailField,
});
