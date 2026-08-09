# Product Core V2 Security Review

## Implemented controls

- Provider and Gemini keys are Edge Function secrets and never enter Expo public configuration, URLs, responses, or logs.
- Public clients use only the Supabase URL and publishable key.
- Market-data, intelligence, telemetry, and feedback requests validate method, body shape/size, symbols, and bounded fields.
- Production fails closed when REAL configuration is absent; REAL never silently substitutes DEMO values.
- Upstream URLs are constructed by server code; client-supplied arbitrary provider URLs are not accepted.
- AI evidence is bounded and labeled untrusted; output requires known source IDs and rejects invented URLs, uncited confirmed claims, unsafe advice, and oversized responses.
- Provider/cache/telemetry tables use RLS with direct anonymous/authenticated access revoked; privileged operations are service-role only.
- Durable provider and product-event windows enforce budgets/rate limits.
- External source links originate from normalized provider/SEC metadata, not model-created URLs.

## Deployment checks

- Apply and review migrations before deploying functions that depend on them.
- Run Supabase security/performance advisors after schema deployment.
- Confirm JWT/publishable-key policy for every function and rotate leaked credentials immediately.
- Verify no secret in Git history, build artifacts, screenshots, crash reports, or logs.
- Confirm cache keys include request, evidence, schema, and provider identity to prevent cross-mode contamination.
- Test malformed JSON, oversized requests, unsupported symbols, rate limits, upstream failures, and cache poisoning attempts.

## Remaining review — UNVERIFIED

- Independent penetration test, dependency audit, production incident response, backup/restore exercise, log retention, and legal/provider licensing review.
- Production telemetry migration and Edge Function are branch changes and remain undeployed until reviewed.

## Final branch audit notes — 2026-08-10

- `npm audit --omit=dev` reports 22 transitive/direct advisories (8 moderate, 14 high, 0 critical) in the Expo 57 / React Native 0.86 / Metro toolchain. npm's proposed automatic fix downgrades to incompatible older major versions, so no force fix was applied. Expo Doctor passes 20/20. Dependency advisories remain a release-review item.
- Supabase security advisors report five INFO-level `rls_enabled_no_policy` notices for service-only tables whose direct mobile-role access is intentionally revoked. Review again after branch migrations are deployed. [Supabase lint guidance](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
- Supabase performance advisors report two INFO-level unused cache-expiry indexes. Low development traffic can produce this signal; retain until query plans are measured after beta load. [Supabase lint guidance](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)
