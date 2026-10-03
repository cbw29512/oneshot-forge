# 99¢ One-Shots Commercial Product Contract

99¢ One-Shots separates adventure quality from commercial release state. A finished adventure must never become a paid product merely because a price exists in the UI. One-Shot Forge remains the underlying runner/build system.

## Product state

`data/products.json` is the storefront source of truth.

Each product records:

- stable product id and title
- price in integer cents
- product and runner URLs
- adventure target metadata
- review/release status
- current access mode
- explicit DM playtest, delivery, approval, and checkout gates

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

A paid product is sellable only when all of these are true:

1. Chris has run the adventure as DM and approved the resulting revision (`releaseGate.dmPlaytestApproved: true`);
2. the adventure has been explicitly approved and frozen (`releaseGate.approved: true`);
3. the browser runner is ready;
4. printable materials are ready;
5. a complete downloadable ZIP is ready;
6. checkout is configured and verified;
7. `releaseGate.checkoutConfigured` is true;
8. `sellable` is true;
9. the exact release head passes repository validation.

The free starter uses the same quality/playtest requirements but does not require checkout.

Until then, the UI must not claim that a customer can purchase the adventure.

## Intended customer flows

Free starter:
Catalog card → product page → run in browser or use printable/downloadable materials.

Paid 99¢ adventure:
Catalog card → product page → hosted checkout → verified purchase/entitlement → run in browser or download the complete ZIP/print kit.

Customers do not need to create a site account to purchase. Purchase verification must be recoverable through the checkout/entitlement system rather than browser localStorage alone.

Payment-provider credentials and purchase verification must not live in client-side JavaScript or this repository. The eventual checkout integration must use a provider-hosted checkout or trusted server-side verification before granting paid access.

## Current Lantern state

The Lantern Below is the permanent **FREE STARTER ADVENTURE** for 99¢ One-Shots. It is not a future paid SKU. It must ship as a complete demonstration of the product: browser runner, pregens, maps, printable material, and a complete downloadable ZIP. It still remains under the DM playtest/revision gate until Chris runs it and approves the final release.

## Current paid-catalog state

All other products remain review builds until DM playtest approval, browser/print/ZIP delivery, and verified checkout are all ready. Right to OwlBear Arms already has a ZIP but still lacks the required browser-run delivery for a paid 99¢ release.
