# MarketBrief Product Core V2 Report

Date: 2026-08-10  
Branch: `codex/marketbrief-product-core-v2`  
Base: PR #8 head `d78de51d57e936d91b68ec442f6b931834260241`

## Product outcome

MarketBrief now centers on one workflow: follow companies, see only material changes since the last stored comparison, inspect a source-timestamped company timeline and cautious Why state, then ask a scoped question or read a validated brief. Zero-change and first-baseline states remain useful without filler.

## Implemented foundations

- Production configuration fails closed; REAL never silently becomes DEMO.
- Local snapshots, seen changes, deterministic materiality, unusual-move context, cross-symbol dedupe, and quiet-stock handling.
- Watchlist-first Today, watchlist Pulse, provider-timestamped Stock timeline, thesis context, overlapping groups, and REAL brief history.
- Contextual Ask comparison anchors, qualitative evidence states, source-linked citations, structured feedback, and privacy-allowlisted telemetry.
- Screen-specific reduced-motion skeletons and resource-specific partial-error language.
- Original Morning/Evening abstract publication artwork with prompt/provenance manifest.
- 69-scenario deterministic intelligence evaluation matrix; no automated live Gemini calls.

## Validation

Final commands:

- `npm install`: passed; 861 packages audited. npm reports 22 advisories (8 moderate, 14 high, 0 critical); no incompatible forced downgrade applied.
- `npm run typecheck`: passed.
- `npm run lint`: passed with no warnings.
- `npm test`: passed, 206 tests, 0 failures/skips/cancellations.
- `npm run functions:check`: passed for `market-data`, `market-intelligence`, and branch-only `product-events`.
- `npm run doctor`: passed, 20/20 checks.
- `npx expo export --platform web`: passed; 40 static routes; 3.1 MB web entry bundle.
- App startup: returned HTTP 200.

## REAL-mode web review

Validated at a 390×844 CSS viewport using temporary process-only public Supabase configuration. No environment file or provider credential was created or printed.

- AAPL quote and daily movement: Twelve Data, REAL.
- AAPL 1D chart: Twelve Data, REAL, range selector present.
- News: Finnhub with publisher, time, and external links; a transient partial failure recovered through the visible Retry action.
- Events: Finnhub with source and scheduled timing.
- Filings: canonical SEC records; UI explicitly says filing body was not analyzed.
- Intelligence: source-linked live response and truthful deterministic fallback were both observed; no DEMO market data appeared.
- Clean onboarding selected AAPL, AMD, and NVDA; after the final race fix, Today showed 3 of 3 and Watchlist retained all three in selected order with real prices.

Evidence captures:

- `docs/screenshots/product-core-v2/real-today-390x844.png`
- `docs/screenshots/product-core-v2/real-aapl-stock-detail-390x844.png`

This is web verification, not native Android or iPhone verification.

## Supabase deployment state

- `market-data`: ACTIVE, version 13.
- `market-intelligence`: ACTIVE, version 42.
- `product-events`: not deployed.
- `20260809181520_product_telemetry.sql`: not applied remotely.

The telemetry schema/function remain branch artifacts until reviewed and deployed after merge. No secret was read or modified.

## Native status and limitations

- Android: no `adb`, emulator, connected device, or configured virtual device available; deferred and unverified.
- iPhone: no simulator/device verification performed; deferred and unverified.
- Dependency audit advisories require release-time Expo ecosystem review.
- Full SEC filing content is unavailable; all filing intelligence remains metadata-only.
- Provider coverage, quotas, timestamps, and news relevance remain subject to upstream records.
- No auth/cloud sync, push notifications, payments, brokerage, trading, recommendations, predictions, or portfolio P&L is included.
