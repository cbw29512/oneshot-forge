# Commercial Product Contract

One-Shot Forge separates adventure quality from commercial release state. A finished adventure must never become a paid product merely because a price exists in the UI.

## Product state

`data/products.json` is the storefront source of truth.

Each product records:

- stable product id and title
- price in integer cents
- product and runner URLs
- adventure target metadata
- review/release status
- current access mode
- explicit approval and checkout gates

## Delivery format and state

Products without `format` use the existing Adventure Package and web runner.
`format: "download-bundle"` records an imported PDF kit with `runnerUrl: null`,
`downloadUrl` pointing to a real local ZIP, `rulesEdition`, `bundleVersion`, and
`auditUrl`. The catalog downloads the kit; its page supplies Start Here and print
materials. It must never create a fake runner entry.

CI verifies imported bytes and individual files against the source manifest.
Migration is not rules certification. Known audit blockers keep `status: review`,
`sellable: false`, and approval closed. Payment invariants apply to both formats.
PDF downloads create no game state; interactive progress remains runner-owned.

## Release invariant

A product is sellable only when all of these are true:

1. the adventure has been explicitly approved and frozen;
2. `releaseGate.approved` is true;
3. checkout is configured and verified;
4. `releaseGate.checkoutConfigured` is true;
5. `sellable` is true;
6. the exact release head passes repository validation.

Until then, the UI must not claim that a customer can purchase the adventure.

## Intended paid flow

Catalog card → product page → checkout provider → verified purchase/entitlement → Start Adventure → ordered Stage Card runner.

Payment-provider credentials and purchase verification must not live in client-side JavaScript or this repository. The eventual checkout integration must use a provider-hosted checkout or trusted server-side verification before granting paid access.

## Current Lantern state

The Lantern Below has a commercial target price of 99 cents but remains `sellable: false` and `status: review` until Chris explicitly approves/finalizes the adventure and a verified checkout path exists. Its current free access remains deliberate rather than pretending checkout is available.
