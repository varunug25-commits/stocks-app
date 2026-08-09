# MarketBrief Product Core V2 Audit

## Audit baseline

- Stacked base: PR #8 head `d78de51d57e936d91b68ec442f6b931834260241`
- Working branch: `codex/marketbrief-product-core-v2`
- Baseline validation: TypeScript, ESLint, 118 tests, both Edge Function Deno checks, and Expo Doctor 20/20 passed.
- Deployed development functions: `market-data` v13 ACTIVE and `market-intelligence` v42 ACTIVE.

## Current architecture map

### Routes and navigation

Expo Router owns authentication, onboarding, five bottom tabs, Search, Stock Detail, Why It Moved, Brief Detail, and contextual Ask. The five customer tabs are Today, Markets, Watchlist, Briefs, and Profile. Ask is correctly contextual rather than a sixth tab. The Markets route is compatible with a future user-facing Pulse label.

### Provider and request boundary

The mobile app calls only Supabase Edge Functions with public project configuration. `market-data` validates requests and symbols, applies server-side provider authentication, caches normalized resources, enforces durable provider budgets, and adapts Twelve Data quotes/bars, Finnhub identity/search/news/events, and SEC filings. `market-intelligence` retrieves M6 resources, creates bounded evidence, calls Gemini server-side, validates claims/citations, caches validated output, and enforces durable generation budgets.

Provider credentials and the service-role key remain server-only. REAL-mode provider failures are represented as unavailable, error, rate-limited, or stale resources; they do not fall back to DEMO data.

### Caches and budgets

- Database: `market_data_cache`, `intelligence_cache`, `provider_request_windows`, and `intelligence_request_windows`.
- Client: provider resources are kept in React context for the current app process; duplicate in-flight requests are suppressed.
- Search: normalized client cache/deduplication plus server-side market-data cache.
- Intelligence: request/evidence/schema/provider-aware cache keys and separate live/fallback namespaces.
- Gap: market resources have no persistent client cache beyond the M6 server cache, so offline behavior is limited to resources already resident in the app process.

### Local state and persistence

- Watchlist: persistent shared model with ordered membership, chart ranges, recent searches, onboarding migration, and a 15-symbol ceiling.
- Onboarding: persistent local preferences and deliberate DEMO/REAL copy separation.
- Briefs: DEMO read/save/filter state persists, but validated REAL generated editions are not stored.
- Intelligence: validated responses are held in memory and server cache; there is no local publication archive.
- Missing abstractions: snapshots, seen evidence, thesis, groups, real briefs, analytics installation identity, and feedback.

### REAL and DEMO separation

REAL mode already avoids static quote/chart/news/event/filing fallbacks. Today and Markets use provider-backed watchlist resources and omit unsupported index/sector data. REAL Briefs omits DEMO history. Remaining risks are configuration defaulting to DEMO when the production variable is absent, a small static onboarding starter list, and a few components/copy paths designed around DEMO-era assumptions.

## Screen audit

### Today

Today currently loads quotes for the entire watchlist, then company/news/events for the first five symbols. It ranks three watchlist movers, shows latest provider news and events, requests a grounded brief, and offers Ask. It does not compare against a last-seen baseline, distinguish seen evidence, compute material changes, deduplicate cross-symbol stories, or make “nothing material changed” a first-class outcome.

### Markets

REAL Markets is already watchlist-first and omits fake indices/sectors, but it remains a generic movers/news/events dashboard. It repeats resource loading already initiated by Today and lacks breadth, concentration, unusual-move, shared-story, and upcoming-catalyst patterns. Product Core V2 should present this route as Pulse while retaining route compatibility.

### Watchlist and Search

Search is provider-backed, debounced, bounded, cached, deduplicated, stale-response safe, and supports inline add/remove. Watchlist membership/order is shared and persistent. The remaining work is denser product polish, optional groups, clearer source freshness, and change/materiality indicators without clutter.

### Stock Detail and Why

Stock Detail loads company, quote, chart, news, events, and filings independently and limits visible news/filings to ten. Chart-range changes correctly fetch bars only. The screen is a sequence of sections rather than a unified evidence timeline. Why already uses grounded, source-linked intelligence and compact historical price evidence, but lacks deterministic evidence-state classification and thesis-aware context.

### Briefs and Ask

REAL Briefs generates a current grounded edition but does not persist validated editions or compare them. Ask is contextual and structured, but its modes and suggestions do not yet include since-last-check, thesis, group, catalyst, and current-brief contexts.

### Profile

Profile contains preferences, sources, disclosures, and compact product information. It is the appropriate location for future thesis/group privacy explanations, analytics disclosure, and data/configuration status—without exposing technical backend terminology.

## Loading, error, stale, empty, and offline audit

- Existing resource states distinguish loading, ready, stale, rate-limited, and error.
- Resource-specific retry exists for primary market data and intelligence.
- Screens render partial resources rather than requiring one all-or-nothing payload.
- Current skeletons are reusable but not yet tailored to snapshot, timeline, brief, and Ask structures.
- Empty states exist, but the first snapshot and empty-watchlist messages do not yet communicate the product thesis.
- Offline banners exist; persisted last-seen/snapshot data is required for a genuinely useful resume experience.

## Fan-out audit

- Today: `N` quote requests plus company/news/event for up to five symbols, then intelligence performs its own evidence retrieval.
- Markets/Pulse: repeats quote/company/news/event requests for the watchlist, although in-flight suppression and server caches reduce upstream spend.
- Stock Detail: company/quote/news/filing/event on initial load plus one selected bar range.
- Intelligence brief: validates all symbols and retrieves quotes for all, then rich evidence for the five most material symbols.

Product Core V2 should share a lightweight snapshot pass, calculate materiality before rich retrieval, reuse loaded resources, and avoid mounting-screen-driven `15 × every resource` bursts.

## Product-core implementation decisions

1. Add fail-closed production configuration before new product behavior.
2. Introduce local-first storage interfaces for snapshots, seen evidence, theses, groups, and real briefs; keep them replaceable by future authenticated cloud stores.
3. Build deterministic change detection, unusual-move context, deduplication, materiality, patterns, and upcoming-event grouping outside UI components.
4. Make Today a concise change report and evolve Markets into Pulse without breaking the route.
5. Build Stock Detail from a chronological evidence timeline and keep AI claims inspectable through the existing citation foundation.
6. Treat thesis text only as user context. Never promote it into verified evidence.
7. Add privacy-conscious allowlisted telemetry and structured feedback without storing raw questions, article bodies, credentials, or thesis text.
8. Preserve M6/M7 provider adapters, secret handling, caches, budgets, validation, and grounded-response constraints.

## Risks and constraints

- Twelve Data and Finnhub free-tier budgets make lightweight-first retrieval mandatory.
- Exact intraday crossing times cannot be shown because the current bar evidence is not an intraday event stream.
- SEC intelligence remains metadata-only until canonical filing bodies are safely retrieved in a future milestone.
- No authentication exists; local state must be migration-friendly but is device-scoped.
- No external analytics service is configured; any telemetry must remain minimal, disclosed, and safely server-controlled.
- Native Android QA depends on an available emulator/device and must not be claimed otherwise.
- Generated editorial images must be original, optional to the information hierarchy, locally stored, and never used to imply a real news photograph or unsupported event.
