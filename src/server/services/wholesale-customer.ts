import "server-only";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

type WholesaleAccountForCustomer = {
  id: string;
  stripeCustomerId: string | null;
  businessName: string;
  taxId: string | null;
};

/**
 * Lazily creates (or re-syncs) the Stripe Customer backing a wholesale
 * account, keeping its tax_exempt status aligned with whether a resale
 * certificate is currently on file. This is what makes "tax-exempt
 * purchasing" on the wholesale landing page a real, working benefit rather
 * than a copy claim with nothing behind it — Stripe Tax reads this flag
 * directly and computes $0 tax for exempt customers on card checkout.
 * Shared by both wholesale checkout paths (card + net-terms invoice) so the
 * exemption logic can't drift between them.
 */
export async function getOrCreateWholesaleStripeCustomer(
  wholesaleAccount: WholesaleAccountForCustomer,
  email: string | null | undefined,
): Promise<string> {
  const taxExempt: "exempt" | "none" = wholesaleAccount.taxId ? "exempt" : "none";

  if (wholesaleAccount.stripeCustomerId) {
    await stripe.customers.update(wholesaleAccount.stripeCustomerId, { tax_exempt: taxExempt });
    return wholesaleAccount.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    name: wholesaleAccount.businessName,
    tax_exempt: taxExempt,
    metadata: { wholesaleAccountId: wholesaleAccount.id },
  });

  await prisma.wholesaleAccount.update({
    where: { id: wholesaleAccount.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
