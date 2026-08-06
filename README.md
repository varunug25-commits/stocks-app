# MarketBrief Mobile

MarketBrief is a native-first personal finance briefing experience built with Expo and React Native. Phase 2 Milestone 3 adds a polished, entirely local watchlist and stock-research experience to the approved mobile shell.

## Current scope

- five-tab personalized finance shell plus global company search;
- one persisted watchlist shared by onboarding, Today, Search, and Stock Detail;
- interactive local stock charts, statistics, catalysts, filings, and stories;
- evidence-separated “Why It Moved” explanations with sources and uncertainty;
- realistic typed mock content only.

There is no real authentication, backend, Supabase, market API, OpenAI integration, payment flow, or push-notification request.

## Run locally

```bash
npm install
npm start
```

Use `a` for Android, `i` for an installed iOS Simulator, or `w` for the browser preview.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run doctor
```

Product, architecture, decisions, testing, and milestone evidence live in [`docs/`](docs/).

## Phase 2 Milestone 3

The mobile shell now includes persistent Watchlist management, enhanced Search, and premium-feeling Stock Detail and Why It Moved routes. Chart ranges and recent searches persist locally; the design includes honest loading, empty, offline, unavailable, full-list, and insufficient-evidence states. Briefs remains an explicit Milestone 4 preview.

No backend authentication, Supabase, live market/news API, AI model, payment service, push service, or brokerage connection is included. See [the Milestone 3 report](docs/PHASE_2_MILESTONE_3_REPORT.md) for checks and screenshots.
