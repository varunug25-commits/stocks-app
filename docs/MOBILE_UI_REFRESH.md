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
