import Stripe from "stripe";

// Constructed lazily, on first real use inside a request — not at module import
// time. Next.js imports every route module during the build to collect page
// metadata; if this ran eagerly and STRIPE_SECRET_KEY were missing or malformed
// at that moment, the entire build would fail even though no request had happened.
let client: Stripe | undefined;

function getClient(): Stripe {
  if (!client) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    // Node's default https.Agent-based client has known connection-pooling
    // issues in serverless environments (frozen/reused containers holding
    // stale keep-alive sockets) — surfaced here as "An error occurred with
    // our connection to Stripe. Request was retried 2 times." on Vercel,
    // despite the exact same call succeeding from a normal long-lived Node
    // process. The fetch-based client avoids that connection-pooling layer
    // entirely and is Stripe's own recommended client for serverless/edge.
    client = new Stripe(process.env.STRIPE_SECRET_KEY, {
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return client;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
