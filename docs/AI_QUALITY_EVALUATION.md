# AI Quality Evaluation

## Automated fixture suite

`tests/intelligence-evaluation.test.ts` runs 69 deterministic scenarios covering the required catalyst, no-catalyst, peer movement, stale/irrelevant/duplicate evidence, filing metadata, events, price context, provider failure, multi-stock briefs, thesis boundaries, citation attacks, unsafe recommendation language, and prompt-injection categories.

The suite does not contact Gemini. It exercises the deterministic provider and the same output validator used at the server boundary. Every accepted response is checked for grounding, citation validity, unsupported causality, uncertainty where required, brevity, symbol relevance, safety language, and format integrity. Adversarial candidates must fail closed.

This suite complements normal software tests; it is not evidence of investment correctness, completeness, or production-provider uptime.

## Optional manual live evaluation

Live evaluation is deliberately manual to protect free-tier budgets and avoid non-deterministic CI:

1. Use only the development Supabase project and server-held AI credential.
2. Select a small, documented sample from the deterministic matrix; do not submit all 69 scenarios.
3. Record the date, model identifier, evidence IDs, response hash, latency, provider mode, and validator result. Never record the credential, full article bodies, or private thesis text.
4. Review grounding, citations, causal restraint, uncertainty, relevance, safety, and concise presentation.
5. Treat a deterministic fallback as a fallback result, not a successful live-model result.
6. Stop on repeated rate limits or provider-plan restrictions; do not scrape or bypass them.

Manual live results must be reported separately from automated results and never described as CI.
