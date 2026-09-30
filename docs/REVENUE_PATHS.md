# Revenue paths — 2026-09-30

## Objective and definition of done

Help visitors understand the existing adventure package, start a free preview,
and optionally support the project. Prepare the storefront for the existing
$0.99 release model. This pass is complete when nested product pages consume
the same catalog as the homepage, support links work without JavaScript,
repeated cards align, and the existing release and validation gates hold.

## Data and state

`data/products.json` remains authoritative. Each product owns `id`,
`priceCents`, `currentAccess`, `sellable`, `releaseGate`, and `commerce`.
Adventure facts and play state continue to use the existing package/runner.

The browser derives preview, purchasable, and owned presentation from those
existing fields and the trusted entitlement response. Page location must not
change the product-contract URL. A donation never changes access or ownership.

The owner-established support URL is
`https://www.buymeacoffee.com/divclass016`. Support links send no adventure,
character, checkout-return, or other application-state data in their URLs.

## Logic flow

1. Visitor chooses an adventure or its printable resources.
2. Homepage and product page load the same root product contract.
3. Existing release/entitlement gates select Start or Buy presentation.
4. Optional support opens the owner's support page independently of play.
5. Catalog or entitlement errors remain logged and never mint ownership.

## Launch blockers

All three current products remain in review with checkout unconfigured.
Opening sales requires explicit adventure approval/freeze, a real provider,
trusted entitlement verification, and protection of paid adventure delivery.
Public static adventure JSON cannot be secured by hiding a Start button.
Do not connect a fictional checkout URL or treat a return URL as payment proof.

The planned $0.99 price is unchanged. Evaluate processor fixed fees before
launch; bundles are a possible future proposal, not a newly released offer.

## Validation and publishing

Run repository validation and exercise nested product pages, failed catalog
loads, preview/purchase/owned states, mobile layout, and support URLs. Keep new
modules below 150 lines; split the existing large runner/stylesheet separately
when their behavior needs to change. Review branches do not approve products.
Use `[skip netlify]` on commits and PR titles; do not publish this pass.
