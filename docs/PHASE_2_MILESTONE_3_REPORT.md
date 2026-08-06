# Phase 2 Milestone 3 Report

## Outcome

Milestone 3 implements the complete local stock-experience shell: persistent Watchlist management, enhanced Search, premium Stock Detail, interactive chart ranges, and a source-aware Why It Moved explanation. It remains an honest design phase with typed illustrative data only.

## UX decisions

- One watchlist is shared across onboarding, Today, Search, Watchlist, and Stock Detail.
- Stock Detail reveals price and chart first, then explanation, catalysts, statistics, filings, stories, sources, and disclosure.
- Why It Moved explicitly separates fact, interpretation, uncertainty, confidence, and source provenance.
- Remove and reorder have visible controls; swipe is never required.
- Full-list, empty, loading, offline, unavailable-chart, and insufficient-evidence states explain recovery or limitations.

## Implementation

- Typed data modules: companies, prices, chart series, statistics, insights, content, and sources.
- Persistent model: saved order, recent searches, chart ranges, dismissed notices, JSON validation, and one-time onboarding migration.
- Reusable components: stock identity/actions, price movement, chart/ranges, evidence cards, catalysts, statistics, filings, stories, sources, freshness, and watchlist management.
- No new runtime dependency was required; the chart uses the project’s existing `react-native-svg` dependency.

## Reviewed blocker closure

- The shared-watchlist blocker is resolved. Today now reads persistent `WatchlistProvider.state.symbols` as the active membership source and preserves that array’s order.
- Search, Watchlist, Stock Detail, Today, and Profile now reflect the same shared watchlist membership. Onboarding state remains responsible for genuine onboarding preferences rather than active membership.
- An empty shared watchlist produces an actionable empty state on Today.
- Today and Watchlist retry controls now leave their deterministic error previews and reload local screen state instead of calling a no-op callback.
- At the five-stock limit, Search keeps the explanation action pressable and labels it “Watchlist full, view limit” instead of announcing it as disabled.
- Regression coverage verifies shared membership across screens and behaviorally checks add, reorder, remove, and empty transitions in Today order.

## Verification

- TypeScript: passed with no errors.
- ESLint: passed with no errors.
- Tests: 29 passed, 0 failed.
- Expo Doctor: 20/20 checks passed.
- Production web export (`npx expo export --platform web`): passed with 38 static routes.
- Development server: started successfully and served the application.

`npm install` completed with the lockfile unchanged. Its audit reports 11 moderate transitive dependency findings; no forced or potentially breaking upgrade was applied during this milestone.

Android-size visual evidence is stored in `docs/screenshots/phase-2-milestone-3/`. These are deterministic Expo web-renderer captures at 412 × 915 for design review, not native-device screenshots.

## Known limitations

- All stock prices, charts, filings, stories, catalysts, sources, freshness, and explanations remain illustrative local mock data.
- There is no Supabase, real authentication, external API, real AI, payment, push notification, brokerage, or trading integration.
- The five-stock limit demonstrates product behavior only; it is not connected to a subscription.
- Native Android testing is intentionally deferred to the consolidated native QA phase and remains unverified.
- Native iPhone testing is intentionally deferred to the consolidated native QA phase and remains unverified.
