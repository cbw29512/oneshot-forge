# Stripe checkout and entitlement contract

99¢ One-Shots treats purchase ownership as server-authoritative. Browser state is presentation only.

## Checkout

`POST /api/stripe/checkout`

Request:

```json
{
  "productId": "the-owlbear-egg"
}
```

The function resolves the product against the server-side Stripe product allowlist. The browser never supplies a trusted price.

A successful response contains a Stripe-hosted Checkout URL:

```json
{
  "url": "https://checkout.stripe.com/..."
}
```

The storefront redirects to that HTTPS Stripe URL.

## Verify ownership

`GET /api/stripe/entitlement?productId={productId}&session_id={optionalCheckoutSessionId}`

Normal repeat visits use the secure entitlement cookie and omit `session_id`.

On the first return from Stripe, the browser supplies the Checkout Session ID from Stripe's success redirect. The server retrieves that Checkout Session from Stripe and grants ownership only when all of these match:

- `payment_status === "paid"`
- Stripe metadata `productId` equals the requested product
- Stripe metadata `storefront === "99centoneshots"`

The server then issues a signed, HttpOnly, Secure, SameSite=Lax entitlement cookie for that product.

### Owned response

```json
{
  "productId": "the-owlbear-egg",
  "access": "owned"
}
```

### Not-owned response

```json
{
  "productId": "the-owlbear-egg",
  "access": "none"
}
```

Unknown products return 404. Missing server configuration returns 503. Paid access fails closed.

## Stripe webhook

`POST /api/stripe/webhook`

The webhook verifies the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET` using Stripe's raw request body. The first supported event is `checkout.session.completed`.

The webhook currently provides verified purchase audit logging. It does not mint browser access by itself because an HTTP webhook cannot set a cookie in the buyer's browser.

## Required environment variables

These values belong in the hosting environment and MUST NOT be committed:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ENTITLEMENT_SIGNING_SECRET`

The public Stripe publishable key is not required for the hosted Checkout redirect used here.

## Security invariants

1. Product ID is matched server-side against the authoritative allowlist.
2. Price is never trusted from browser input.
3. Provider credentials and webhook secrets never ship to static assets.
4. Query strings, localStorage, sessionStorage, and cookies created solely by browser JavaScript cannot mint ownership.
5. A Checkout success redirect is not ownership; the server re-fetches the Stripe Checkout Session.
6. Verification outages fail closed for paid content.
7. Entitlement responses contain no card data or provider secrets.
8. Stripe webhook signatures are verified against the raw request body.
9. A paid adventure remains unsellable until DM playtest approval, browser delivery, printable delivery, downloadable ZIP delivery, checkout configuration, and repository validation all pass.

## Free starter

The Lantern Below is the permanent free starter. It does not require Stripe entitlement, but it must still meet the same playability and complete-delivery quality bar before being presented as the finished starter product.

## Known production boundary

The current repository still exposes review adventure files as static site assets. Before any paid adventure is released, paid browser packages and paid ZIP files must move behind entitlement-aware delivery so a direct static URL cannot bypass checkout.
