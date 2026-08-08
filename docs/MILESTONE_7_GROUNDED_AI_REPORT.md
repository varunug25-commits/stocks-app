# Milestone 7 — Grounded Intelligence

## Scope

Milestone 7 adds one shared evidence and citation engine for Grounded Why It Moved, grounded Morning/Evening editions in REAL mode, relevant-news quick reads, SEC filing summaries, and contextual Ask MarketBrief. The five-tab architecture and premium visual system remain unchanged; Ask is not a sixth tab.

## Starting point

- Starting `main` HEAD: `03cca4ce4c46a49b5a89b6960ae55e9d2f54a92a`
- PR #7 merge confirmed before implementation
- Feature branch: `codex/m7-grounded-marketbrief-ai`

## Architecture

`market-intelligence` is a server-side Supabase Edge Function above the existing M6 `market-data` function. It retrieves bounded normalized resources from M6, converts them to typed evidence, ranks and removes noise, invokes a replaceable structured-output provider, validates every claim and citation, and returns a client-safe response.

The mobile client never calls a model provider. It sends only a task, supported symbols, a bounded question, optional edition/focus, and time window using existing public project configuration.

### Provider abstraction

`StructuredAIProvider` exposes `generateStructuredResponse({ request, evidence, untrustedContext })`. The milestone ships `MockStructuredAIProvider`, a deterministic zero-token provider. No paid AI request, AI SDK, or AI secret is included.

### Evidence and ranking

Evidence types are `quote`, `price_move`, `news`, `filing`, `event`, and `company`. Each record has a server-created ID/content hash plus optional symbol, title, bounded text, publisher, time, provider URL, metadata, and deterministic relevance score.

Ranking favors current moves, direct ticker/company-name matches, provider-related symbols, recent company-specific coverage, filings, upcoming events, and material absolute watchlist moves. Broad stories without a direct company match are penalized. Repeated URLs and normalized headlines are removed. Limits are 24 items, 480 characters per evidence text, and roughly 7,200 serialized context characters.

### Claims and citations

Canonical claim kinds are `confirmed`, `interpretation`, `uncertainty`, and `catalyst`. Validation fails closed for unknown kinds/sources, unsupported symbols, confirmed claims without sources, model-authored URLs, unsafe financial language, malformed structures, or excessive output. `generatedAt` and returned sources are server-owned. URLs come only from the evidence set.

## Customer behavior

- **Why It Moved:** separates facts, possible factors, uncertainty, and next catalysts; it states when no clear company-specific catalyst exists.
- **News:** Stock Detail offers a relevant-story Quick Read and excludes low-relevance noise.
- **Filings:** Stock Detail offers Key Changes while explicitly limiting the mock result to verified filing metadata, not a full filing-body analysis.
- **Briefs:** REAL mode ranks material watchlist evidence into morning/evening bullets. DEMO stays deterministic and illustrative; REAL failure never falls back to demo narrative.
- **Ask MarketBrief:** contextual to the current stock or shared watchlist, limited to supported evidence and a 280-character question. No generic finance-chat mode exists.

The historical archive remains illustrative until grounded editions have durable publication storage.

## Cache and cost controls

Validated results are cached in server-only `intelligence_cache` with RLS and no mobile-role privileges. Keys include task, ordered symbols, normalized question hash, focus/edition, time window, evidence IDs/hashes, and schema version. TTLs are 15 minutes for Why/Ask/news, 30 minutes for briefs, and 60 minutes for filing summaries. Evidence or schema changes invalidate the key. Identical in-flight requests are deduplicated. An instance-local 20-request/minute limiter is included; distributed throttling remains pre-launch hardening.

## Prompt-injection and security

News and filing text is wrapped as explicitly untrusted evidence. Commands inside retrieved content remain inert. Provider URLs are omitted from model context because URLs never need to be model-authored. No prompt, model secret, provider credential, or service-role key is returned to the client or placed in a URL.

## M6 preservation

M7 does not rewrite M6. Quotes, bars, companies, news, events, filings, provider auth headers, caches, budgets, stale recovery, latest-ten presentation, range-only chart fetching, and resource-specific retries remain in their existing modules. Intelligence failure cannot replace those resources.

## Limitations

- Generation is deterministic mock behavior, not a live language model.
- A real provider/model decision and server-only secret are still required before claiming live AI.
- Filing intelligence has metadata only because M6 does not provide filing-body text.
- The previous-edition archive remains illustrative.
- The rate limiter is instance-local, not distributed.
- No authentication, payments, alerts, push notifications, brokerage, trading, or recommendation engine was added.
- Native verification is reported only if actually performed during final validation.
