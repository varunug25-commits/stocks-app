# Mobile UI refresh

## Scope and checkpoint

- Starting commit: `60d467616b662cbe37ec95e054e186899df2e748`.
- Working branch: `codex/mobile-ui-refresh`.
- User requested direct, original implementation without external design extensions.
- Preserve watchlist persistence, change detection, REAL/DEMO separation, sources, chart-range fetching, and existing intelligence behavior.
- No backend, authentication, payment, notification, or new AI work.

## Design direction

Create a calm consumer-finance app with a warm near-black canvas, neutral charcoal surfaces, readable warm-white type, and a restrained teal action color. Green and red communicate signed financial movement. Financial rows remain solid and compact. A single watchlist summary and bottom navigation may use restrained glass with a solid Android fallback.

Today presents three important watchlist movers before the change report, known upcoming events, and a compact brief entry. First-baseline and quiet states explain what is known without filling the screen with technical copy. Search, Watchlist, Stock Detail, Pulse, Briefs, and Profile share the same identity, spacing, controls, and quiet disclosures.

Use bundled brand glyphs only where they accurately identify the company; other companies receive explicit ticker monograms. No fabricated logos, scraped images, invented charts, or new remote media requests. Existing original publication artwork may be reused.

## Review criteria

- Inspect 390 × 844 and narrower mobile viewports.
- Check all five tabs, search/add, stock opening, chart controls, Edit/Done, reorder/remove, brief selection, and group controls.
- Inspect loading, empty, offline, error/retry, long company names, bottom safe area, and scrolling.
- Preserve source/freshness and explicit demo identification without large developer-facing banners.
- Run typecheck, lint, existing tests, production web export, and app startup.
- Native Android/iPhone verification must be reported separately; mobile web screenshots are not native tests.

## Baseline checks

- Typecheck: passed.
- Lint: passed.
- Tests: 206 passed, 0 failed.
- Startup and final verification: recorded after local preview review.

## Implemented changes

- Shared visual foundation: warm charcoal layers, warm-white text, restrained teal actions, distinct gain/loss colors, readable metadata, stronger type hierarchy, and consistent safe-area/navigation spacing.
- Today: top three shared-watchlist movers, directional counts, real source/freshness states, compact change/quiet states, upcoming events, and a short brief preview linking to the existing complete publication.
- Watchlist and Search: brand glyphs where supported, explicit ticker fallbacks, wrapping company names, readable prices, compact truthful demo disclosure, neutral unavailable-price treatment, clear focus and selection states, and preserved Edit/Done/add/remove/reorder/limit behavior.
- Stock Detail: stronger price hierarchy, flat chart presentation, clearer local-time intraday labels, segmented range controls, touch exploration, and a fully visible latest-point marker after asynchronous hydration.
- Narrow chart correction: browser review found delayed RN Web layout measurements could leave the latest point outside a 320px viewport. A web-only observer with cleanup measures the actual chart container; the SVG view box also scales safely while a resize settles. Native layout measurement is preserved.
- Pulse: truthful watchlist breadth visualization, clear numerical hierarchy, compact quiet states, and retained source-based patterns/events.
- Briefs: editorial typography, restrained existing original artwork, readable edition selection, preserved archive, full publication, sources, and save state.
- Profile and loading: a compact personal summary, clearer disclosure copy, singular/plural preference counts, readable disabled group controls, and row-shaped reduced-motion-safe skeletons.
- Web accessibility: chart ranges and brief editions announce their checked state, bottom tabs announce selection, and saved briefs expose a pressed state. Native accessibility state remains intact. Browser review caught the React Native Web state-serialization gap; regression coverage now guards the explicit ARIA equivalents.
- Search's single-result count reads "1 match". Its redundant header demo badge was removed; the existing in-content demo disclosure remains visible.
- iOS blur retains Android/web opaque fallbacks. No external design service, project dependency change, new media download, model feature, backend migration, or provider change was used.

## Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed, no warnings.
- `npm test`: 207 passed, 0 failed (206 existing tests plus one accessibility regression).
- `npm run functions:check`: passed for all three existing function entry points; no function source was changed or deployed.
- Production web export: `EXPO_OFFLINE=1 node node_modules/expo/bin/cli export --platform web --max-workers 2`; completed, 40 routes, with the original static-output configuration.
- `npm run doctor`: 20/21 checks passed. The remaining check flags 12 existing Expo ecosystem patch-version mismatches. Package manifests and the lockfile were not changed by this refresh.
- `git diff --check`: passed. No formatter command is configured in this repository.
- Local browser startup: passed. An isolated development web export runs locally for visual review; temporary single-output preview configuration is restored to the original static output before committing. Production REAL/DEMO rules were not weakened.

## Mobile browser review

The screenshots are actual local app captures, not design mockups. Browser review uses DEMO mode, reduced motion, and isolated test storage. It does not read or overwrite the user's normal browser storage.

- Today, Watchlist, Search, Pulse, Briefs, Profile, and AAPL Stock Detail checked at 390 × 844 and 320 × 844.
- Checked readable financial values, company names, solid dark surfaces, signed movement, screen scrolling, and visible bottom-tab navigation.
- Chart range selection, selected-tab state, and brief edition/save semantics verified in the browser accessibility tree.
- Watchlist Edit/Done, persisted reorder, confirmed removal, stock search/add, duplicate protection, empty search, and immediate shared membership on Today verified.
- Morning/Evening selection, full-publication navigation, saving a brief, and creating/deleting a group verified.
- Existing explicit preview routes used to inspect Watchlist empty, error/retry, loading, and offline states. Retry removes the error preview and restores the normal list.
- Limit-sheet appearance checked through its explicit preview route. Full 15-symbol capacity interaction is not claimed as a browser pass with the ten-company DEMO catalogue; existing source/model regression tests still cover the limit semantics.
- No browser runtime exceptions or horizontal page overflow found in the supported-catalogue review flow. No customer-facing debug control found.
- Separate exploratory test: importing a 15-symbol watchlist containing symbols outside the DEMO catalogue fails with `No illustrative brief data is available for AVGO.` The same Today `generateBrief` call and generator are present in starting commit `60d4676`. This pre-existing DEMO edge case is recorded below, not hidden as a passing test.

Screenshot evidence and machine-readable results are in [`screenshots/mobile-ui-refresh/`](screenshots/mobile-ui-refresh/). Key captures:

- [Today](screenshots/mobile-ui-refresh/today-390x844.png)
- [Watchlist](screenshots/mobile-ui-refresh/watchlist-390x844.png)
- [Search](screenshots/mobile-ui-refresh/search-390x844.png)
- [Pulse](screenshots/mobile-ui-refresh/pulse-390x844.png)
- [Briefs](screenshots/mobile-ui-refresh/briefs-390x844.png)
- [Profile](screenshots/mobile-ui-refresh/profile-390x844.png)
- [Stock Detail](screenshots/mobile-ui-refresh/stock-390x844.png)
- [Review results](screenshots/mobile-ui-refresh/review-results.json)
- [Chart resize measurements](screenshots/mobile-ui-refresh/chart-resize-results.json)

## Changed files

Screens:

```text
src/app/(tabs)/index.tsx
src/app/(tabs)/markets.tsx
src/app/(tabs)/watchlist.tsx
src/app/(tabs)/briefs.tsx
src/app/(tabs)/profile.tsx
src/app/search.tsx
src/app/stock/[symbol].tsx
```

Shared components and tokens:

```text
src/theme/tokens.ts
src/components/briefs/BriefActions.tsx
src/components/briefs/BriefHeroCard.tsx
src/components/briefs/BriefTypeSelector.tsx
src/components/finance/CompanyLogo.tsx
src/components/finance/StockRow.tsx
src/components/foundation/GlassBackdrop.tsx
src/components/foundation/IconButton.tsx
src/components/foundation/LogoMark.tsx
src/components/foundation/ProductHeader.tsx
src/components/intelligence/IntelligencePanel.tsx
src/components/market/DataModeBanner.tsx
src/components/materiality/MaterialChangeRow.tsx
src/components/navigation/BottomTabBar.tsx
src/components/profile/GroupManager.tsx
src/components/search/SearchField.tsx
src/components/search/SearchResultRow.tsx
src/components/stock/ChartRangeSelector.tsx
src/components/stock/PriceChart.tsx
src/components/stock/PriceMovement.tsx
src/components/stock/StockHeader.tsx
src/components/stock/WatchlistRow.tsx
src/components/system/SkeletonState.tsx
```

Documentation and tests:

```text
docs/MOBILE_UI_REFRESH.md
docs/MOBILE_DESIGN_SYSTEM.md
docs/SCREEN_ARCHITECTURE.md
docs/COMPONENT_INVENTORY.md
docs/IMAGE_AND_MEDIA_POLICY.md
docs/screenshots/mobile-ui-refresh/*.png
docs/screenshots/mobile-ui-refresh/*.json
tests/milestone-2.test.ts
tests/premium-redesign.test.mjs
```

## Scope and limitations

The preview uses explicitly labelled DEMO data. This task does not claim live-provider revalidation, native Android verification, native iPhone verification, or GitHub CI results. Existing REAL-mode configuration and no-demo-fallback rules are preserved. The branch is based on the unmerged Product Core V2 work; it is not merged into `main`.

The DEMO catalogue contains ten companies. An imported REAL watchlist containing other symbols can currently fail in the existing illustrative brief generator when opened in DEMO mode. This is a separate pre-existing functional limitation, not caused or fixed by the UI refresh. Do not treat these screenshots as validation of a 15-company imported watchlist in DEMO mode. A small follow-up should make unsupported demo brief coverage explicit without inventing data, before using such a list in a demo build.

Implementation commit: `8668bbb`.
