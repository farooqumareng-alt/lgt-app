import { z } from "zod";

import { EmailField } from "@/lib/validation/auth";

export const NewsletterSignupSchema = z.object({
  email: EmailField,
});
