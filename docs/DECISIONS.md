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
