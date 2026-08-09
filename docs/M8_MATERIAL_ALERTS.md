# M8 — Material Alerts

M8 is a future design, not implemented in Product Core V2. Alerts should answer “what materially changed?” rather than act as dumb price thresholds.

## Candidate alerts

- **Unusual move + new evidence:** a statistically unusual move and a new company-specific source occur within a defensible window.
- **New thesis-relevant evidence:** verified evidence overlaps topics in the user’s locally saved thesis; the thesis itself is never evidence.
- **Important filing:** a new canonical SEC filing record appears. Metadata-only alerts must not summarize unseen filing text.
- **Upcoming catalyst:** a provider-backed event enters a configured horizon.

## Generation pipeline

1. Compare a fresh snapshot to the prior stored snapshot.
2. Apply deterministic materiality, recency, personal relevance, and seen-state penalties.
3. Deduplicate by canonical source/event identity and merge cross-symbol occurrences only when the relationship is supported.
4. Require the relevant evidence record before generating copy.
5. Apply per-stock, per-group, global, and provider-budget limits.
6. Respect quiet hours and collapse related events into one notification.
7. Record delivery and open state without raw thesis/question text.

## Preferences and safety

- Global on/off, quiet hours, minimum materiality, per-stock and per-group preferences.
- Rate limits per installation/account and a daily digest fallback.
- No price predictions, buy/sell wording, fabricated cause, or notification when evidence is stale beyond policy.
- Push tokens require consent, secure server storage, revocation, and privacy/legal review.

Push delivery is explicitly out of scope until M8 is approved.
