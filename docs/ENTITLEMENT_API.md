# Entitlement API contract

One-Shot Forge treats purchase ownership as server-authoritative. Browser state is presentation only.

## Verify ownership

`GET /api/entitlements/{productId}`

The request must carry the deployment's authenticated customer session. The browser never supplies a trusted `owned` value.

### 200 response

```json
{
  "schemaVersion": 1,
  "productId": "the-lantern-below",
  "owned": true,
  "access": "owned",
  "verifiedAt": "2026-09-22T02:00:00Z"
}
```

`access` is one of `owned`, `preview`, or `none`. `owned: true` is valid only when the server has verified the provider purchase for the authenticated customer and matching product ID.

### Error responses

- `401` — no valid customer session.
- `404` — unknown product ID.
- `503` — provider/entitlement verification unavailable. Fail closed for paid access; do not convert this to ownership in the browser.

Error body:

```json
{
  "schemaVersion": 1,
  "error": "entitlement_unavailable",
  "message": "Purchase verification is temporarily unavailable."
}
```

## Checkout handoff

The catalog may navigate to the configured provider checkout URL only after the product release gates pass. A checkout return URL is not proof of purchase. After checkout, the browser requests the entitlement endpoint again and changes the action to **Start Adventure** only from a server response with `owned: true`.

## Security invariants

1. Product ID is matched server-side against the authoritative product catalog.
2. Price is never trusted from browser input.
3. Provider credentials and webhook secrets never ship to static assets.
4. Query strings, localStorage, sessionStorage, cookies set solely by client JavaScript, and checkout success pages cannot mint ownership.
5. Verification outages fail closed for paid content and show a retryable message.
6. Entitlement responses contain no payment-card or provider-secret data.

## Current preview behavior

Until an adventure is approved/frozen and checkout is configured, its `currentAccess` may remain `free-preview`. This keeps editorial review independent from future paid entitlement while preventing the catalog from claiming the product is for sale.
