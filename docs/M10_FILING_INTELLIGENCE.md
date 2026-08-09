# M10 — SEC Filing Intelligence

Current MarketBrief filing intelligence is metadata-only. It may state form type, filing date, company identity, and canonical SEC URL. It must not claim to have read management commentary, risks, guidance, or numbers from an unavailable filing body.

## Future ingestion

1. Retrieve only from canonical SEC sources with a compliant user agent and pacing.
2. Cache accession metadata and immutable source documents.
3. Enforce document-size, content-type, redirect, and timeout limits.
4. Sanitize HTML; remove scripts, navigation, exhibits outside policy, and hidden content.
5. Extract known 10-K, 10-Q, and 8-K sections while preserving character/source spans.
6. Chunk by semantic section with bounded overlap and stable chunk hashes.
7. Rank only relevant chunks and send bounded untrusted content to the intelligence provider.
8. Require section/span citations in every factual output and preserve the canonical filing URL.

## Potential outputs after body retrieval exists

What Changed, Key Numbers, Management Commentary, Risk Changes, Guidance, and Compare to Previous Filing. Each output requires cited filing text; unavailable sections stay unavailable.

## Security and validation

- Treat filing HTML and text as untrusted data, never model instructions.
- Prevent SSRF by allowlisting SEC hosts and validating redirects.
- Do not infer missing periods or compare incompatible forms.
- Retain source spans, extraction version, document hash, and generated-response hash.
- Review SEC terms, attribution, caching, and redistribution obligations — **UNVERIFIED**.

No filing-body retrieval or analysis is implemented in this milestone.
