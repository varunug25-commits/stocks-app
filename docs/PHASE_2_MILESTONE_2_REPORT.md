# Phase 2 Milestone 2 Report

## Outcome

Milestone 2 completes the local mobile discovery shell on `codex/phase-2-full-ui-ux`. It adds five-tab navigation, a personalized Today feed, Markets discovery, global local search, onboarding-connected Watchlist, a Briefs preview, and a local-preference Profile. PR #1 remains draft and unmerged.

## Screens completed

- Today: current date, locally personalized greeting/watchlist, market status, indices, 60-second editorial summary, events, sourced stories, timestamps, demo disclosure, refresh, and loading/offline/closed/empty/error variants.
- Markets: S&P 500, Nasdaq, Dow, Russell 2000, market mood, sectors, gainers/losers/active filters, earnings, economic events, search entry, timestamps, and detail sheets.
- Search: recent/trending suggestions, symbol/company matching, clear action, result rows, empty/offline variants, and stock preview sheets.
- Watchlist: onboarding-selected companies, empty handling, Add stock route, and Milestone 3 detail preview.
- Briefs: Morning and Evening preview cards with explicit Milestone 4 notice.
- Profile: local onboarding experience, goals, interests, stocks, and notification preference only.

## Components and mock data

New reusable modules include `BottomTabBar`, market status/sector/mover/filter/mood/timestamp/event/closed-state components, and search field/result components. `src/data/markets.ts` and `src/data/search.ts` contain typed, realistic local mock data and pure local search logic. Existing finance, feedback, skeleton, empty, and bottom-sheet components are reused.

## UX and accessibility

The shell uses bottom-tab navigation, horizontal rails, full-width lists, large touch targets, haptics, pull-to-refresh, skeleton loading, and bottom-sheet disclosure. Controls have accessibility labels, and positive/negative movement uses signs, text, and icons in addition to colour. No desktop dashboard patterns were introduced.

## Validation

- `npm install`: completed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 17/17.
- `npm run doctor`: passed, 20/20 checks.
- Expo production web export: passed, 36 static routes.

Tests also assert that no Supabase, network fetch, OpenAI SDK, or Stripe/payment integration is present in the source shell.

## Screenshots

Twenty-six viewport captures are stored in `docs/screenshots/phase-2-milestone-2/`:

- Android-sized web validation: 13 states at exactly 412 × 915.
- iPhone layout reference: 13 states at exactly 393 × 852.
- States: Today normal/loading/offline/market closed; Markets overview/sectors/movers; Search default/results/empty; Watchlist; Briefs placeholder; Profile.

These are responsive Expo web captures. Native Android testing is pending because no physical Android device was available. The iPhone set is a layout reference only; native iPhone verification is not claimed.

## Known limitations and deferred work

- All prices, market status, stories, sources, timestamps, and events are illustrative local data.
- Search does not call external services or persist new watchlist additions.
- Stock detail sheets are lightweight placeholders; full company pages, charts, explanations, alerts, and watchlist management are deferred to Milestone 3.
- Morning/Evening Brief generation is deferred to Milestone 4.
- Backend authentication, Supabase, news/market APIs, AI calls, payments, push notifications, subscriptions, and brokerage connectivity are intentionally absent.
- `npm install` reports 11 moderate findings in the current transitive dependency tree; no forced or breaking audit rewrite was performed.
