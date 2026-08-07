# MarketBrief Mobile — Project Control

## Product goal

MarketBrief is a calm, mobile-first market companion that helps an everyday investor understand what matters today. The current release adds a secure real-data foundation behind the approved native design shell.

## Current phase

**Milestone 6: Real Data Foundation**

This phase delivers:

- Supabase migrations and a server-side Edge Function;
- vendor-neutral market, news, filings, company, and event interfaces;
- Twelve Data, Finnhub, SEC EDGAR, and company-registry adapters;
- normalized MarketBrief domain contracts and typed database schema;
- centralized cache TTLs, stale-cache recovery, structured provider errors, and freshness metadata;
- explicit `REAL`/`DEMO` modes with no silent fallback; and
- progressive provider-backed wiring for Today, Markets, Watchlist, Search, and Stock Detail.

## Explicitly out of scope

Do not add these until a later approved phase:

- real authentication or remote user accounts;
- AI model calls or generated analysis;
- AI chatbot or Ask MarketBrief;
- alerts, notification preferences, or alert delivery;
- brokerage connections, trading, or payments;
- push notifications; and
- production subscriptions.

The previous standalone local Milestone 5 Alerts/Preferences plan is cancelled. Real alerts and notification preferences move to Milestone 8. Milestone 6 does not add Milestone 7 AI or any Milestone 8 alert work.

Deterministic brief and Why It Moved copy is presentation data only and must remain clearly identified as illustrative, non-AI content.

## Delivery sequence

1. Product-control documents
2. Expo application shell and navigation
3. Shared theme tokens and primitives
4. Today screen with realistic local data
5. Loading, empty, modal, and bottom-sheet states
6. iOS and Android visual QA
7. Stable shell checkpoint before any data integration

## Quality gates

Every milestone must pass:

- TypeScript with no errors;
- lint with no errors;
- available automated tests;
- Expo dependency compatibility checks; and
- a successful Metro development-server start.

Before any future API phase, the complete mobile shell must also be reviewed on at least one iPhone simulator and one Android emulator or physical device.

## Branch and release policy

- `main` remains stable and shippable.
- Each major phase uses a `codex/` feature branch.
- Commits represent small working milestones.
- Feature branches are pushed to GitHub for backup and review.
- No feature merges until all quality gates pass.

## Source of truth

When requirements disagree, use this priority:

1. The latest direct user instruction
2. `AGENTS.md`
3. This project-control document
4. The design-system and architecture documents
5. Existing implementation details
