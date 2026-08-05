# MarketBrief Architecture Decisions

## ADR-001 — Local persistence with AsyncStorage

Use `@react-native-async-storage/async-storage`, installed through `expo install`, because the milestone requires small, Expo-compatible, maintained key-value persistence. Typed helpers isolate storage keys and JSON handling from screens. No server synchronization is implied.

## ADR-002 — Mock auth is navigation, not identity

Authentication screens validate local input and expose loading/error states, but never issue credentials, tokens, or network requests. The mock session flag exists only to support the designed returning-user path.

## ADR-003 — Reducer-backed onboarding

One provider and pure reducer own onboarding choices. Screens stay focused on one decision, back navigation preserves state, and the pure reducer can be behavior-tested without a native runtime.

## ADR-004 — Design reference provenance

`docs/design/marketbrief-full-ui-kit.png` is extracted from the user-provided master specification and retained only as the supplied internal implementation reference. New editorial imagery remains governed by the media policy.
