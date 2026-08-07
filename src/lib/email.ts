import "server-only";
import { Resend } from "resend";

// Lazy, same principle as src/lib/stripe.ts — Next's build-time page-data
// collection imports every route; constructing this eagerly would fail the whole
// build if RESEND_API_KEY were missing at that moment, even though no request
// had happened yet.
let client: Resend | undefined;

function getClient(): Resend {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

// Resend's own test sender — works with zero setup, no domain verification
// needed. Swap for a real address (e.g. "Leather Goods Texas <noreply@
// leathergoodstexas.com>") once a domain is verified in the Resend dashboard.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Leather Goods Texas <onboarding@resend.dev>";

// The site's only outbound side of the Contact page — sent to the business
// inbox with the customer's address as reply-to, so replying directly
// reaches them. The submission is always persisted to ContactMessage first
// (see submitContactMessage), so a Resend hiccup here never loses the
// message, only delays the notification.
const CONTACT_FORM_RECIPIENT = process.env.CONTACT_FORM_RECIPIENT;

export async function sendContactFormNotification(input: {
  name: string;
  email: string;
  orderNumber: string | null;
  message: string;
}) {
  if (!CONTACT_FORM_RECIPIENT) {
    throw new Error("CONTACT_FORM_RECIPIENT is not set");
  }

  await getClient().emails.send({
    from: FROM_EMAIL,
    to: CONTACT_FORM_RECIPIENT,
    replyTo: input.email,
    subject: `Contact form: ${input.name}${input.orderNumber ? ` (Order ${input.orderNumber})` : ""}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #2B2320;">
        <h1 style="font-size: 20px; margin: 0 0 16px;">New contact form message</h1>
        <p style="margin: 0 0 4px; opacity: 0.8;"><strong>From:</strong> ${input.name} (${input.email})</p>
        ${input.orderNumber ? `<p style="margin: 0 0 16px; opacity: 0.8;"><strong>Order:</strong> ${input.orderNumber}</p>` : ""}
        <p style="margin: 16px 0 0; white-space: pre-line;">${input.message}</p>
        <p style="margin: 24px 0 0; font-size: 13px; opacity: 0.6;">Reply directly to this email to respond to ${input.name}.</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(to: string, code: string) {
  await getClient().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${code} is your Leather Goods Texas verification code`,
    text: `Your verification code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #2B2320;">
        <h1 style="font-size: 20px; margin: 0 0 16px;">Verify your email</h1>
        <p style="margin: 0 0 24px; color: #2B2320; opacity: 0.8;">
          Enter this code to finish setting up your Leather Goods Texas account:
        </p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 0 0 24px; color: #8f652f;">
          ${code}
        </p>
        <p style="margin: 0; font-size: 13px; color: #2B2320; opacity: 0.6;">
          This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
