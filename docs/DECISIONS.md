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
