# MarketBrief Architecture Decisions

## ADR-001 — Local persistence with AsyncStorage

Use `@react-native-async-storage/async-storage`, installed through `expo install`, because the milestone requires small, Expo-compatible, maintained key-value persistence. Typed helpers isolate storage keys and JSON handling from screens. No server synchronization is implied.

## ADR-002 — Mock auth is navigation, not identity

Authentication screens validate local input and expose loading/error states, but never issue credentials, tokens, or network requests. The mock session flag exists only to support the designed returning-user path.

## ADR-003 — Reducer-backed onboarding

One provider and pure reducer own onboarding choices. Screens stay focused on one decision, back navigation preserves state, and the pure reducer can be behavior-tested without a native runtime.

## ADR-004 — Design reference provenance

`docs/design/marketbrief-full-ui-kit.png` is extracted from the user-provided master specification and retained only as the supplied internal implementation reference. New editorial imagery remains governed by the media policy.

## ADR-005 — Local Milestone 2 discovery shell

Keep all market/search content in typed local mock modules until the complete mobile shell is stable. Search and stock taps open preview sheets, avoiding dead controls while deferring full detail to Milestone 3. Today personalization uses persisted onboarding selections and experience level rather than inventing a stored user name. Deterministic query-driven states exist only for repeatable design validation. Brief generation remains deferred to Milestone 4.

## ADR-006 — One persisted watchlist domain

Use one reducer-backed watchlist state for saved symbols, ordering, recent searches, chart ranges, and notice dismissal. Migrate valid onboarding symbols once, then persist only the new domain model. Screens dispatch typed actions rather than maintaining duplicate collections.

## ADR-007 — Evidence-safe local explanations

Model Why It Moved as local editorial presentation data with separate facts, interpretations, uncertainty, confidence, freshness, and source metadata. Show an insufficient-evidence state when the model is not supportable. Do not generate recommendations, price targets, or live claims.

## ADR-008 — Deterministic local brief generation

Build Morning and Evening editions from typed local templates plus existing illustrative stock, filing, catalyst, and source modules. A pure generator accepts a dated seed and the ordered shared-watchlist symbols, making personalization deterministic and behavior-testable without a network or AI provider.

## ADR-009 — One Briefs persistence domain

Use a reducer-backed `BriefsProvider` for read IDs, saved IDs, selected edition type, history filters, and dismissed notices. Validate persisted JSON, remove corrupted values, hydrate safely after storage rejection, and never let a persistence failure block the UI. Share payload construction stays pure; the screen alone invokes React Native `Share`.

## ADR-010 — Honest evidence boundaries

Every brief separates fact, interpretation, and uncertainty and includes a low-confidence insufficient-evidence variant that states what is missing. Brief copy is local illustrative editorial data, not model output, investment advice, or evidence of a live feed.

## ADR-011 — Server-side provider boundary

Expo calls one MarketBrief Supabase Edge Function using public project identifiers. Twelve Data, Finnhub, SEC contact configuration, cache writes, and provider error details remain server-side. Mobile modules consume normalized MarketBrief contracts rather than vendor JSON and never reference third-party secret identifiers.

## ADR-012 — Explicit real/demo modes

`REAL` and `DEMO` are explicit runtime modes. Demo fixtures support automated tests and design review. A failed real request becomes unavailable, rate-limited, stale, or error state; it never becomes a demo quote or chart. Deterministic brief and Why It Moved content remains separately labeled local narrative.

## ADR-013 — Stable company identity

Use UUID company IDs with symbol, exchange, currency, and CIK as attributes. Ticker symbols remain lookup aliases rather than permanent company identifiers. Logo URLs stay null until a permitted source and license are recorded.

## ADR-014 — Centralized caching and stale recovery

The Edge Function uses the protected `market_data_cache` table and one TTL map: quotes 60 seconds, bars 5 minutes, news 15 minutes, events 1 hour, filings 6 hours, and company profiles 7 days. Fresh cache avoids provider calls. Expired real data may be returned only as explicitly stale with the provider error code when refresh fails.

## ADR-015 — Provider and licensing scope

Twelve Data and Finnhub adapters are for development/internal prototype use only. No production commercial external-display right is assumed. SEC retrieval uses structured `data.sec.gov` submissions, a configurable descriptive User-Agent with monitored contact, and a conservative interval below the SEC maximum.
