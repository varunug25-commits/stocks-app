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

`StructuredAIProvider` exposes `generateStructuredResponse({ request, evidence, untrustedContext })`. The milestone keeps `MockStructuredAIProvider` as a deterministic zero-token fallback and adds the server-only `GeminiStructuredAIProvider` for the stable `gemini-3.5-flash` model. The live provider is selected only when `MARKETBRIEF_AI_API_KEY` exists in the Supabase Edge Function environment; the key is sent in the supported `X-Goog-Api-Key` header and never appears in a URL, client bundle, log, response, or repository file.

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

Validated results are cached in server-only `intelligence_cache` with RLS and no mobile-role privileges. Keys include task, ordered symbols, normalized question hash, focus/edition, time window, evidence IDs/hashes, provider identity, and schema version. TTLs are 15 minutes for Why/Ask/news, 30 minutes for briefs, and 60 minutes for filing summaries. Evidence, provider, or schema changes invalidate the key. Live-provider activation advances the schema to `m7-v2`, so a previous mock result cannot be reused as a live response. Identical in-flight requests are deduplicated. An instance-local 20-request/minute limiter is included; distributed throttling remains pre-launch hardening. Gemini requests use the supported `generateContent` endpoint with JSON MIME mode, the current `responseJsonSchema` field, minimal thinking, an explicit provider abort deadline, no Google Search grounding, and the bounded M7 evidence context. The schema is intentionally compact because Gemini rejects overly complex/deep schemas; MarketBrief's server validator remains authoritative and fails closed on malformed structure, unsupported claims, citations, URLs, symbols, or length limits. Genuine Gemini transport, quota, permission, timeout, or invalid-output failures fall back to the deterministic provider with explicit mock metadata and a separate cache namespace. Request, evidence, cache, and MarketBrief backend failures do not silently become mock AI output.

## Live activation verification

- Supabase `market-intelligence` version 40 is ACTIVE on development project `jkatugzutluclvnhqhle`.
- A fresh `news_summary` request for AAPL returned HTTP 200 in 12.51 seconds with `provider: google-gemini-3.5-flash`, `providerMode: live`, `cached: false`, 3 validated sections, 8 server-controlled sources, and 11 evidence items.
- Repeating that exact request returned HTTP 200 in 1.71 seconds with the same `generatedAt`, `providerMode: live`, and `cached: true`.
- AAPL `why_moved` returned HTTP 200 from the previously validated live Gemini cache with 3 sections and 3 sources. It did not return deterministic/mock metadata.
- Regression coverage verifies the provider key is sent only in the `X-Goog-Api-Key` header, never in the URL/body/output, and verifies live-provider failures use the separate deterministic fallback/cache while the live provider is retried on a later request.
- No native Android or iPhone verification was performed for this activation pass.

## Prompt-injection and security

News and filing text is wrapped as explicitly untrusted evidence. Commands inside retrieved content remain inert. Provider URLs are omitted from model context because URLs never need to be model-authored. No prompt, model secret, provider credential, or service-role key is returned to the client or placed in a URL.

## M6 preservation

M7 does not rewrite M6. Quotes, bars, companies, news, events, filings, provider auth headers, caches, budgets, stale recovery, latest-ten presentation, range-only chart fetching, and resource-specific retries remain in their existing modules. Intelligence failure cannot replace those resources.

## Limitations

- Live generation depends on the configured Gemini free-tier availability and quota; without the server secret, the function truthfully reports the deterministic mock provider in response metadata.
- Filing intelligence has metadata only because M6 does not provide filing-body text.
- The previous-edition archive remains illustrative.
- The rate limiter is instance-local, not distributed.
- No authentication, payments, alerts, push notifications, brokerage, trading, or recommendation engine was added.
- Native verification is reported only if actually performed during final validation.
