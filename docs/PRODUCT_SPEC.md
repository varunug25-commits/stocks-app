# MarketBrief Product Specification

## Product promise

MarketBrief helps an everyday investor understand what matters today without presenting a dense trading terminal. It is an editorial, personalized finance feed designed for native phone interaction.

## Phase 2 Milestone 1

The milestone establishes the entry experience: splash, mock authentication, local account states, seven-step onboarding, and local preference persistence. A user can explore every route without a network request or real account.

## Success criteria

- Every entry and onboarding screen is reachable and has useful interaction feedback.
- Back navigation preserves prior onboarding choices.
- Stock selection allows three to five unique local companies.
- Completing onboarding persists experience, goals, interests, stocks, notification preference, completion, and mock session.
- Returning completed users can enter the existing Today feed.
- Controls have accessible labels, roles, states, readable type, and at least 44-point targets.

## Explicitly deferred

Real authentication, Supabase, live market or news APIs, AI generation, payments, push permissions, full Stock Details, complete Briefs, Alerts, Profile account expansion, Paywall, and Legal screens.

## Phase 2 Milestone 2 delivery

The approved local design shell now includes a personalized Today feed, complete local Markets discovery, symbol/company search, onboarding-connected Watchlist, Briefs preview, and local preference Profile. Stock detail, live data, AI-generated briefs, alerts, payments, and backend accounts remain deferred.

## Phase 2 Milestone 3 delivery

Milestone 3 turns the preview watchlist into one persistent local collection shared across onboarding, Today, Search, Watchlist, and Stock Detail. It adds add/remove/reorder management, recent searches, five chart ranges, company statistics, catalysts, filings, stories, source metadata, freshness labeling, and an expanded Why It Moved explanation. All values and explanations are typed illustrative data; no investment recommendation or live-data implication is permitted.

Success requires useful empty, loading, offline, unavailable, full-list, and insufficient-evidence states, plus non-swipe alternatives for every management action.

## Phase 2 Milestone 4 delivery

Milestone 4 replaces the Briefs preview with a complete local Morning Brief and Evening Recap experience. The home screen selects a brief type, opens the latest edition, filters history by saved/unread and type, and preserves those choices locally. Detail answers what happened, why it matters, how the ordered shared watchlist is affected, and what to monitor next. It also exposes sources, timestamps, confidence, fact/interpretation/uncertainty separation, and an explicit insufficient-evidence state.

Today opens the latest Morning Brief detail and does not maintain a second briefing implementation. Read and saved state update immediately and persist through validated AsyncStorage JSON. Sharing uses the native share surface with deterministic demo-only text and no fabricated URL.

All prices, charts, filings, stories, catalysts, sources, explanations, and briefs remain illustrative local mock data. Real AI, external APIs, backend accounts, alerts, payments, push notifications, brokerage, and trading are outside this milestone.

## Milestone 6 delivery

Milestone 6 introduces the secure real-data boundary: Expo calls a MarketBrief Supabase Edge Function using public project identifiers, while Twelve Data and Finnhub secrets remain server-side. The server normalizes quotes, OHLCV bars, company-news metadata, earnings events, company identities, and SEC submissions into MarketBrief domain contracts before the UI receives them.

Today, Markets, Watchlist, Search, and Stock Detail progressively consume the shared data provider. Every surface exposes loading, unavailable, rate-limited, stale, malformed-response, and network-error behavior without substituting demo values in `REAL` mode. `DEMO` remains an explicit mode for tests and design evidence.

Brief editorial generation and Why It Moved remain deterministic local, non-AI content. They are visually and textually separated from provider-backed values. Milestone 6 adds no AI/chat, alerts, notification preferences, push, payments, subscriptions, brokerage, trading, portfolio holdings, or advanced expansion.
