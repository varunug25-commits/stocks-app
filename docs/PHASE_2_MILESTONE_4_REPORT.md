# Phase 2 Milestone 4 — Personalized Briefs Report

## Outcome

Milestone 4 is implemented on `codex/phase-2-milestone-4-briefs` for draft review. MarketBrief now has a complete local Briefs home/history experience and a long-form Brief Detail route for deterministic Morning Briefs and Evening Recaps. Today opens the same latest Morning Brief route instead of maintaining a duplicate briefing sheet. Review hardening adds edition-specific history, claim-linked sources, a real local persistence reload, and accurate Share results. The pull request must not be merged until review approval.

## UX decisions

- The Briefs home is an editorial feed, not a dashboard: one Morning/Evening selector, one leading edition, then compact history.
- Morning uses the established teal/green atmosphere; Evening adds a restrained indigo surface while remaining within the dark design system.
- History filters live in a bottom sheet rather than remaining permanently visible.
- Long-form detail uses concise paragraphs and section hierarchy: summary, market context, watchlist impact, next events, scenarios, evidence, sources, and disclosure.
- `NEW`, `READ`, and `SAVED` are communicated with text and tone rather than colour alone.
- The insufficient-evidence state explicitly refuses to invent causation and states what evidence is missing.

## Route architecture

- `/briefs`: tab-owned Briefs home, selector, latest edition, history, filters, refresh, and deterministic preview states.
- `/brief/[briefId]`: root-stack Brief Detail with stack back navigation, read/save/share actions, ordered watchlist impact, and evidence disclosure.
- `/stock/[symbol]`: existing Stock Detail destination used by every brief stock-impact row.
- Today constructs the latest Morning Brief identity and navigates to `/brief/[briefId]`.

## Local generation architecture

Typed modules under `src/data/briefs/` define dated history seeds, Morning/Evening templates, generated brief types, source metadata, deterministic generation, and pure share-text construction. The generator combines existing illustrative price, insight, catalyst, filing, and source modules. It makes no fetch, backend, or AI-provider call.

Every dated history seed resolves to edition-specific headline, summary, developments, market context, monitor items, and scenarios rather than reusing the latest edition’s copy. Claim records carry typed source IDs, every referenced ID is present in that edition, and the UI shows both evidence-card citations and the claims each source supports.

Morning Briefs cover overnight context, market direction, three developments, the ordered watchlist impact, scheduled events, three monitor points, and positive/risk interpretations. Evening Recaps add closing context, what changed since morning, tomorrow’s setup, and the same evidence structure.

## Watchlist personalization

`WatchlistProvider.state.symbols` is the sole active membership source for Today, Briefs home, and Brief Detail. The generator maps symbols in that exact persisted order; visual QA verified `AAPL → NVDA → AMD`. Onboarding stocks are used only for the one-time initial migration. A first-run handoff fix ensures choices populate an already-created empty shared watchlist before onboarding completion, while a completed user’s intentionally empty watchlist remains empty.

## Persistence model

`BriefsProvider` and its pure reducer own:

- `readIds`;
- `savedIds`;
- selected Morning/Evening type;
- saved/unread status filter;
- Morning/Evening history filter; and
- dismissed notice IDs.

AsyncStorage reads validate the full JSON structure. Corrupted values are removed safely. Rejected reads leave defaults usable and hydration always finishes; rejected writes do not break the screen.

## Screens and components

The milestone builds Briefs home, Brief Detail, Today-to-Brief integration, Morning/Evening selector, hero, history rows, status badges, filter sheet, summary points, market context, stock-impact rows, events, evidence cards, empty states, and save/share actions. React Native `Share` receives a deterministic demo-labeled payload without a fabricated URL.

## Review fixes

- Historical Morning and Evening editions now have date-specific editorial content and visible history headlines.
- Facts, interpretations, watchlist impacts, catalysts, filings, and macro events carry typed source mappings; irrelevant or unsupported causal sources are not presented in insufficient-evidence output.
- Pull-to-refresh now awaits a real AsyncStorage reload through `BriefsProvider.reload`; the timer-only refresh implementation was removed.
- Native Share feedback distinguishes shared, dismissed, unknown, and thrown/error outcomes. Dismissal is not reported as success.
- The proposed advanced Brief expansion remains cancelled; no advanced expansion state, route, or component was added.

## Automated tests

Final result: **48 tests passed, 0 failed**.

Behavior coverage includes Morning/Evening generation, unique historical editions, claim/source integrity, ordered watchlist personalization, empty watchlist, insufficient evidence, read/save/unsave, selected type, saved/unread filters, persistence round-trip, corrupted JSON, rejected storage operations, first-run watchlist migration, share construction, and Share result handling. Supplemental architecture checks cover real reload behavior, route registration, Today navigation, stock-detail navigation, failure/retry states, reusable boundaries, cancelled advanced expansion, and absence of external providers.

Node reported non-failing `MODULE_TYPELESS_PACKAGE_JSON` performance warnings for TypeScript test files. These do not affect correctness or the exit result.

## Final validation

All commands were run locally on August 7, 2026. These are local Codex checks, not GitHub CI.

| Command | Exact result |
| --- | --- |
| `npm install` | Exit 0; packages already up to date; 850 packages audited; npm reported 11 moderate-severity dependency audit findings and made no dependency changes. |
| `npm run typecheck` | Exit 0; `tsc --noEmit` produced no errors. |
| `npm run lint` | Exit 0; ESLint produced no errors or warnings. |
| `npm test` | Exit 0; 48 passed, 0 failed, 0 skipped. |
| `npm run doctor` | Exit 0; Expo Doctor reported `20/20 checks passed. No issues detected!` |
| `npx expo export --platform web` | Exit 0; web and server bundles completed; 39 static routes exported to ignored `dist/`, including `/briefs` and `/brief/[briefId]`. |
| Expo development start | `http://127.0.0.1:8081` returned HTTP 200 during milestone checks. |

## Screenshot evidence

The 15 captures below are deterministic **Expo web-renderer design evidence at 412 × 915**. They are not native Android or native iPhone screenshots.

- `briefs-home-morning.png` — Briefs home, Morning
- `briefs-home-evening.png` — Briefs home, Evening
- `brief-history.png` — complete history list
- `saved-filter.png` — saved-only history result
- `empty-watchlist.png` — useful unpersonalized state
- `loading.png` — skeleton state
- `offline.png` — offline banner with retained local content
- `error-retry.png` — error state with actionable retry
- `morning-detail-top.png` — Morning Brief identity and executive summary
- `evening-detail-top.png` — Evening Recap identity and summary
- `watchlist-impact.png` — ordered personalized companies
- `what-matters-next.png` — earnings, filing, macro, and monitor items
- `evidence-structure.png` — fact, interpretation, and uncertainty
- `sources-disclosure.png` — sources, relevance, and disclaimer
- `insufficient-evidence.png` — low-confidence missing-evidence treatment

Location: `docs/screenshots/phase-2-milestone-4/`.

## Known limitations and deferred work

- Every stock price, chart, filing, story, catalyst, source, explanation, and brief is illustrative local mock data.
- Dates and history seeds are deterministic design fixtures rather than live scheduled editions.
- Native Share is implemented, but the Expo web renderer may report sharing as unavailable; native behavior remains unverified.
- `npm install` reports 11 moderate dependency audit findings. No automatic audit fix was applied because it may introduce unrelated or breaking dependency changes.
- Native Android testing for Milestone 4 is deferred and unverified.
- Native iPhone testing for Milestone 4 is deferred and unverified.
- No Supabase, backend, real authentication, external market/news API, real AI or AI SDK, payments, subscriptions, paywall flow, alerts, push notifications, brokerage, trading, portfolio holdings, options, or community feature was added.
- Real API and AI work remains deferred until the complete mobile design shell is stable and separately approved.
- Milestone 5 was not started.
