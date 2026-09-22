# Checkout and entitlement contract

One-Shot Forge sells access to runnable adventures, not downloadable secrets embedded in browser code.

## Release state

A product may expose a paid Buy action only when all of these are true:

1. Chris has approved and frozen the adventure.
2. `sellable` is `true`.
3. `releaseGate.checkoutConfigured` is `true`.
4. `commerce.provider` identifies the configured payment provider.
5. `commerce.checkoutUrl` points to the provider checkout flow.
6. `commerce.entitlementMode` is `server-verified`.
7. `commerce.entitlementVerificationUrl` points to a server-side verification endpoint.
8. The exact release head passes CI.

## Trust boundary

Browser JavaScript may display product state and initiate checkout. It must never decide that payment succeeded, mint an entitlement, contain payment secrets, or unlock paid content based only on local storage or query-string values.

The payment provider is responsible for payment collection. A server-side endpoint must verify provider evidence and return the customer's entitlement state. Only verified entitlement may unlock a paid runner once paid access is enabled.

## Failure behavior

Missing, malformed, or incomplete commerce configuration fails closed: no Buy action and no paid-content unlock. Review/free-preview behavior remains available while a product is not sellable.

## Current Lantern state

`The Lantern Below` remains in review/free-preview. Its provider and checkout/verification URLs intentionally remain null until Chris approves the adventure and a real payment provider integration is configured.
