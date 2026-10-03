import Stripe from "stripe";
import type { Config, Context } from "@netlify/functions";
import { getStripeProduct } from "./_stripe-products.mts";
import {
  entitlementCookieName,
  issueEntitlementToken,
  readCookie,
  verifyEntitlementToken,
} from "./_entitlement-token.mts";

function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

export default async (request: Request, _context: Context) => {
  try {
    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }

    const url = new URL(request.url);
    const productId = url.searchParams.get("productId")?.trim() ?? "";
    const sessionId = url.searchParams.get("session_id")?.trim() ?? "";
    const product = getStripeProduct(productId);
    if (!product) return json({ productId, access: "none" }, 404);

    const signingSecret = Netlify.env.get("ENTITLEMENT_SIGNING_SECRET");
    if (!signingSecret) {
      console.error("99centoneshots entitlement blocked: ENTITLEMENT_SIGNING_SECRET is not configured");
      return json({ productId, access: "none" }, 503);
    }

    const cookieName = entitlementCookieName(productId);
    const cookieToken = readCookie(request, cookieName);
    if (await verifyEntitlementToken(cookieToken, productId, signingSecret)) {
      return json({ productId, access: "owned" });
    }

    if (!sessionId) {
      return json({ productId, access: "none" });
    }

    const stripeSecretKey = Netlify.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("99centoneshots entitlement verification blocked: STRIPE_SECRET_KEY is not configured");
      return json({ productId, access: "none" }, 503);
    }

    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const validPurchase =
      session.payment_status === "paid" &&
      session.metadata?.productId === productId &&
      session.metadata?.storefront === "99centoneshots";

    if (!validPurchase) {
      console.warn("99centoneshots entitlement rejected Stripe session", {
        sessionId,
        productId,
        paymentStatus: session.payment_status,
        metadataProductId: session.metadata?.productId ?? null,
      });
      return json({ productId, access: "none" }, 403);
    }

    const token = await issueEntitlementToken(productId, signingSecret);
    const cookie = [
      `${cookieName}=${encodeURIComponent(token)}`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      "Max-Age=31536000",
    ].join("; ");

    return json(
      { productId, access: "owned" },
      200,
      { "set-cookie": cookie },
    );
  } catch (error) {
    console.error("99centoneshots entitlement verification failed", error);
    return json({ error: "Entitlement verification failed." }, 500);
  }
};

export const config: Config = {
  path: "/api/stripe/entitlement",
};
