# MarketBrief Mobile

MarketBrief is a native-first personal finance briefing experience built with Expo and React Native. Milestone 6 adds a secure real-data foundation behind the approved mobile experience while preserving explicit demo fixtures for tests and design review.

## Current scope

- five-tab personalized finance shell plus global company search;
- one persisted watchlist shared by onboarding, Today, Search, and Stock Detail;
- normalized provider-backed quotes, charts, filings, company news, and events through a Supabase Edge Function;
- explicit `REAL` and `DEMO` data modes with no silent fallback;
- evidence-separated “Why It Moved” explanations with sources and uncertainty;
- deterministic Morning and Evening briefs personalized from the ordered shared watchlist;
- persisted brief read, saved, selector, and history-filter preferences;
- deterministic brief and Why It Moved narratives that remain clearly illustrative until grounded AI work is separately approved.

Third-party provider secrets never enter the Expo bundle. There is still no real authentication, AI/chat, payment flow, alert delivery, push notification, brokerage, or trading capability.

## Real-data setup

Copy `.env.example` to an ignored local environment file and configure public Expo identifiers separately from server-only provider secrets. `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `EXPO_PUBLIC_MARKETBRIEF_DATA_MODE` are the only client-facing values. `TWELVE_DATA_API_KEY`, `FINNHUB_API_KEY`, and `SEC_USER_AGENT` belong only in Supabase Edge Function secrets.

`SEC_USER_AGENT` must identify the MarketBrief development application and include a monitored contact address as required by SEC fair-access guidance. Never commit the resulting environment file.

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

## Milestone 6

The Expo client calls one MarketBrief Edge Function with a public Supabase project key. The function owns provider secrets, normalization, caching, stale-data recovery, and structured failures. Twelve Data supplies development equity quotes/time series, Finnhub supplies development company-news metadata and earnings events, and SEC EDGAR supplies official filings when configured.

No provider connection or hosted Supabase deployment is claimed until separately configured and verified. Free/personal provider plans must not be assumed to permit production commercial external display. See [the Milestone 6 report](docs/MILESTONE_6_REAL_DATA_REPORT.md) for architecture, setup, verification, and limitations.
