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
