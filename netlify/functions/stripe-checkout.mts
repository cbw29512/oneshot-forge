import Stripe from "stripe";
import type { Config, Context } from "@netlify/functions";
import { getStripeProduct } from "./_stripe-products.mts";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default async (request: Request, _context: Context) => {
  try {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const stripeSecretKey = Netlify.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("99centoneshots checkout blocked: STRIPE_SECRET_KEY is not configured");
      return json({ error: "Checkout is not configured yet." }, 503);
    }

    const body = await request.json().catch(() => null) as { productId?: string } | null;
    const productId = body?.productId?.trim() ?? "";
    const product = getStripeProduct(productId);
    if (!product) {
      console.warn("99centoneshots checkout rejected unknown product", { productId });
      return json({ error: "Unknown or unavailable product." }, 400);
    }

    const origin = new URL(request.url).origin;
    const stripe = new Stripe(stripeSecretKey);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: product.amountCents,
            product_data: {
              name: product.title,
              description: "99¢ One-Shots complete digital adventure",
            },
          },
        },
      ],
      metadata: {
        productId: product.id,
        storefront: "99centoneshots",
      },
      success_url:
        `${origin}/?checkout_return=${encodeURIComponent(product.id)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/adventures/${encodeURIComponent(product.id)}.html?checkout=cancelled`,
      billing_address_collection: "auto",
    });

    if (!session.url) {
      console.error("99centoneshots Stripe session returned without URL", { sessionId: session.id });
      return json({ error: "Checkout could not be started." }, 502);
    }

    return json({ url: session.url });
  } catch (error) {
    console.error("99centoneshots checkout creation failed", error);
    return json({ error: "Checkout could not be started." }, 500);
  }
};

export const config: Config = {
  path: "/api/stripe/checkout",
};
