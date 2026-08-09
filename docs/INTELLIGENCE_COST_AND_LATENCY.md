# Intelligence Cost, Latency, and Fan-out

## Current decision

Gemini structured generation uses `maxOutputTokens: 4096`. The response validator permits at most six sections, five bullets per section, 240 characters per bullet, and 12,000 serialized characters; the prompt asks for at most four sections and three bullets each. This leaves headroom for valid structured JSON without an 8K worst-case output allocation.

Typical deterministic responses in the 69-scenario evaluation remain within those structural bounds. Exact live token/latency measurement is not claimed because automated evaluation does not call Gemini. A small manual sample may record model, latency, response hash, and serialized size as described in `docs/AI_QUALITY_EVALUATION.md`.

## Two-pass retrieval

For general Why/Brief/Ask requests, the server first validates company identity and loads one cheap quote per valid symbol. It then ranks absolute moves and loads rich news, filings, events, and one-month bars for at most five selected symbols (one for Why). News-only and filing-only tasks request only their relevant resource after validation.

This avoids a 15-stock × five-resource blast. A 15-stock general brief currently has a bounded first pass of 15 company checks + 15 quotes, then at most 5 × 4 rich-resource requests. Market-data caching and provider budgets remain authoritative; identical validated intelligence requests are cached by request/evidence/provider identity, and live and deterministic fallback caches remain separate.

## Guardrails

- Reuse provider cache; do not refetch because a second component mounted.
- Materiality first, rich evidence second.
- No background prefetch without measured product benefit.
- Preserve partial-resource errors and stale labels instead of inventing freshness.
- Revisit fan-out only with provider-budget telemetry and measured user value.
