"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import type Stripe from "stripe";

import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getOrCreateCart } from "@/server/repositories/cart";

const SITE_URL = process.env.AUTH_URL ?? "http://localhost:3000";

const SHIPPING_OPTIONS: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
  {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: 800, currency: "usd" },
      display_name: "Standard Shipping",
      delivery_estimate: {
        minimum: { unit: "business_day", value: 5 },
        maximum: { unit: "business_day", value: 7 },
      },
    },
  },
  {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: 1800, currency: "usd" },
      display_name: "Express Shipping",
      delivery_estimate: {
        minimum: { unit: "business_day", value: 2 },
        maximum: { unit: "business_day", value: 3 },
      },
    },
  },
];

export async function createCheckoutSession() {
  const cart = await getOrCreateCart();
  if (cart.items.length === 0) {
    redirect("/cart");
  }

  // Never trust the cart snapshot for the actual charge — re-validate live.
  for (const item of cart.items) {
    if (!item.productVariant.isActive || item.quantity > item.productVariant.stockQuantity) {
      redirect("/cart?error=stock");
    }
  }

  const session = await auth();

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map((item) => {
    const variant = item.productVariant;
    const product = variant.product;
    const unitAmount = Math.round(
      Number(variant.priceRetailOverride ?? product.basePriceRetail) * 100,
    );
    const variantLabel = [variant.color, variant.size].filter(Boolean).join(" / ");

    return {
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: unitAmount,
        product_data: {
          name: variantLabel ? `${product.name} (${variantLabel})` : product.name,
        },
      },
    };
  });

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options: SHIPPING_OPTIONS,
      automatic_tax: { enabled: true },
      customer_email: session?.user?.email ?? undefined,
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/checkout`,
      metadata: {
        cartId: cart.id,
        ...(session?.user?.id ? { userId: session.user.id } : {}),
      },
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    redirect(checkoutSession.url);
  } catch (error) {
    // redirect() above throws Next.js's own internal control-flow signal on
    // success — let that propagate untouched. Only genuine errors fall through.
    unstable_rethrow(error);
    // Full detail server-side only (Vercel logs) — never show a raw Stripe/SDK
    // error message to the customer.
    console.error("createCheckoutSession failed:", error);
    redirect("/checkout?error=1");
  }
}
