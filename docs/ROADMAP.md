# MarketBrief Roadmap

## Complete

- Phase 1: Expo foundation, dark design system, reusable finance cards, and polished mock Today feed.
- Phase 2 Milestone 1: mock authentication, seven-step onboarding, local preferences, tests, and device-size evidence.
- Phase 2 Milestone 2: five-tab discovery shell, personalized Today, Markets, Search, Watchlist preview, Briefs preview, and Profile.
- Phase 2 Milestone 3: persistent shared watchlist, enhanced Search, Stock Detail, charts, research, and evidence-safe explanations.
- Phase 2 Milestone 4: deterministic Morning/Evening Briefs with evidence-safe local narrative.
- Milestone 6: secure real-data foundation with Supabase, normalized providers, caching, freshness, and explicit REAL/DEMO separation.

## Recommended next milestone

Review Milestone 7: grounded evidence, citation validation, Why It Moved, REAL-mode briefs, and contextual Ask MarketBrief using the zero-token deterministic provider.

## Later

- The standalone local Alerts/Preferences Milestone 5 is cancelled.
- A live M7 model provider remains deferred until the provider/model and server-side secret are explicitly approved.
- Milestone 8 will combine real alerts, notification preferences, and push delivery after real data and grounded AI exist.
- Authentication, payments, subscriptions, brokerage, trading, holdings, and advanced expansion work remain separately deferred.

## Current status

- Phase 2 Milestone 2: approved and merged through PR #1 after real-device Android smoke testing.
- Milestone 3: approved and merged through PR #2; native Milestone 3 testing remains deferred.
- Milestone 4: approved and merged through PR #3 at `089e74b1b1fde896c4754ae7d0518c00759f1127`; native testing remains deferred and unverified.
- Milestone 6: approved and merged; hosted `market-data` and configured development providers were verified before M7.
- Milestone 7: in development on `codex/m7-grounded-marketbrief-ai`; no paid model request or AI secret is included.

Alerts, push, backend authentication, subscriptions, payments, brokerage, trading, and recommendation features are not part of Milestone 7.
