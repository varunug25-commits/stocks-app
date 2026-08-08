# MarketBrief Testing

## Automated checks

- `npm run typecheck`: strict TypeScript compilation.
- `npm run lint`: Expo ESLint rules across `src` and `tests`.
- `npm test`: structure, integration guardrails, routes, accessibility markers, onboarding reducer behavior, duplicate prevention, five-stock ceiling, and completion state.
- `npm run doctor`: Expo dependency and configuration compatibility.

## Manual milestone matrix

Validate Splash, Login, Sign Up, Forgot Password, Email Verification, Welcome, Experience, Goals, Interests, Stocks, Notifications, Completion, and Today. Check forward and backward navigation, validation messages, social-provider demo feedback, offline preview, stock search, three-stock minimum, five-stock maximum, and persisted completion.

## Device evidence

Screenshots are stored in `docs/screenshots/phase-2-milestone-1/`. This Mac has no Xcode/iOS Simulator, and its only installed Android 37 Play Store image repeatedly causes a System UI ANR under the available 8 GB RAM. The committed evidence therefore uses the Expo web renderer at exact 393×852 iPhone and 412×915 Android viewports. Native screenshots remain a documented follow-up validation item rather than being misrepresented.

## Milestone 2 validation

- TypeScript, ESLint, 17 local tests, Expo Doctor, and a production web export are required before approval.
- Tests cover five tabs, Briefs, onboarding-selected Today stocks, dynamic date implementation, Markets modules, symbol/company search, empty results, forbidden integrations, accessibility, onboarding, and storage resilience.
- Responsive evidence uses exact web viewports: Android-sized 412 × 915 and iPhone reference 393 × 852.
- The iPhone set is layout reference only; native iPhone validation is not claimed.
- The user later performed native Android smoke testing on a real phone. Verified scope: app launch, Splash, mock Login, onboarding, stock selection, Today, Markets, Search, Watchlist, Briefs preview, Profile, and an overall good UI impression.
- That smoke test does not establish detailed performance, accessibility, low-memory, notification, payment, production, or native screenshot coverage. Native iPhone validation remains pending.

## Milestone 3 validation

- Unit tests cover duplicate prevention, five-stock limits, remove/reorder behavior, one-time onboarding migration, persisted order/recent searches/chart ranges, and chart endpoint consistency.
- Structural tests cover stock routes, explanation hierarchy, reusable components, Search/Watchlist integration, accessible labels, and the continued absence of network or forbidden service integrations.
- Deterministic Android-size evidence is captured at 412 × 915 in `docs/screenshots/phase-2-milestone-3/` for normal, empty, limit, search, chart, explanation, research, offline, and insufficient-evidence states.
- Native Android validation of Milestones 1–2 remains verified by the user. Milestone 3 native Android interaction testing and all native iPhone testing remain pending and are not claimed.

## Milestone 4 validation

- Behavior tests cover Morning/Evening generation, ordered shared-watchlist personalization, empty and insufficient-evidence output, reducer transitions, saved/unread filtering, validated persistence, rejected storage reads, and share-text construction.
- Supplemental route checks cover Briefs home/detail registration, Today integration, stock-detail navigation, accessibility-oriented actions, working retry implementation, and forbidden external-service boundaries.
- Fifteen deterministic screenshots at 412 × 915 live in `docs/screenshots/phase-2-milestone-4/`: both home editions, history/filter, empty/loading/offline/error states, detail sections, evidence, sources, and insufficient evidence.
- The screenshots are Expo web-renderer design evidence, not native Android or iPhone screenshots.
- Milestone 4 native Android testing is deferred and unverified. Milestone 4 native iPhone testing is deferred and unverified.
- Review regression coverage additionally verifies uniqueness across every dated edition narrative, deterministic generation, exact claim/source unions, SEC-only filing evidence, insufficient-evidence citation safety, the absence of Briefs refresh controls, accurate shared/dismissed/unknown Share feedback, and the continued absence of the cancelled advanced Brief expansion.

## Milestone 6 validation

- Behavioral tests cover Twelve Data quote/chart normalization, SEC filing normalization, Finnhub news metadata, malformed responses, missing secrets, provider rate limits, cache hits, expired-cache refresh, stale-cache recovery, stable company IDs, freshness labels, and request validation.
- Real/demo tests prove missing real configuration remains unavailable and does not invoke or return demo fixtures.
- Security checks prove third-party secret identifiers are absent from all Expo runtime modules, protected cache/registry tables have RLS enabled, and `anon`/`authenticated` grants are revoked.
- Architecture checks confirm Today, Markets, Watchlist, Search, and Stock Detail use the shared `MarketDataProvider`; Briefs and Why It Moved remain explicitly local and non-AI.
- Provider adapters are tested with deterministic fixtures. The connected development project has both migrations and Edge Function version 2 deployed. The company-registry request/cache path is live; successful Twelve Data, Finnhub, and SEC provider retrieval is not claimed because their server configuration is absent.
- Final Milestone 6 review validation passed 71/71 automated tests. Review coverage verifies provider publisher/timestamp/source-URL preservation, SEC canonical-URL preservation, public request validation, shared concurrent budgets, blocked cooldowns, cache hits that spend no upstream quota, stale-cache recovery when quota is exhausted, and missing configuration that spends no provider budget. Exact command outcomes are recorded in `MILESTONE_6_REAL_DATA_REPORT.md`.
