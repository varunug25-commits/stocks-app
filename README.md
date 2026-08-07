# MarketBrief Mobile

MarketBrief is a native-first personal finance briefing experience built with Expo and React Native. Phase 2 Milestone 4 adds polished, entirely local Morning Brief and Evening Recap experiences to the approved mobile shell.

## Current scope

- five-tab personalized finance shell plus global company search;
- one persisted watchlist shared by onboarding, Today, Search, and Stock Detail;
- interactive local stock charts, statistics, catalysts, filings, and stories;
- evidence-separated “Why It Moved” explanations with sources and uncertainty;
- deterministic Morning and Evening briefs personalized from the ordered shared watchlist;
- persisted brief read, saved, selector, and history-filter preferences;
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

## Phase 2 Milestone 4

The Briefs tab now offers complete Morning Brief and Evening Recap home/history experiences plus `/brief/[briefId]` long-form detail. Today opens the latest Morning Brief rather than a duplicate temporary sheet. Briefs preserve the shared watchlist order and separate facts, interpretation, uncertainty, and missing evidence.

No backend authentication, Supabase, live market/news API, AI model, payment service, alert service, push service, or brokerage connection is included. See [the Milestone 4 report](docs/PHASE_2_MILESTONE_4_REPORT.md) for checks, limitations, and Expo web-renderer screenshots.
