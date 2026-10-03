import Stripe from "stripe";
import type { Config, Context } from "@netlify/functions";

export default async (request: Request, _context: Context) => {
  try {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const stripeSecretKey = Netlify.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Netlify.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeSecretKey || !webhookSecret) {
      console.error("99centoneshots webhook blocked: Stripe environment is incomplete");
      return new Response("Webhook not configured", { status: 503 });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      console.warn("99centoneshots webhook rejected request without Stripe-Signature");
      return new Response("Missing signature", { status: 400 });
    }

    const rawBody = await request.text();
    const stripe = new Stripe(stripeSecretKey);

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      console.error("99centoneshots webhook signature verification failed", error);
      return new Response("Invalid signature", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("99centoneshots purchase completed", {
        sessionId: session.id,
        productId: session.metadata?.productId ?? null,
        paymentStatus: session.payment_status,
      });
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("99centoneshots webhook failed", error);
    return new Response("Webhook failure", { status: 500 });
  }
};

export const config: Config = {
  path: "/api/stripe/webhook",
};
