# M9 — Authentication and Cloud Sync

M9 is a future architecture. Product Core V2 keeps user state local and does not add authentication.

## Sync scope

Supabase Auth may later sync watchlist order, groups and overlapping memberships, theses, snapshots, seen evidence, REAL brief history, and preferences. Provider cache rows and generated evidence are server resources, not user-owned sync documents.

## Anonymous-to-account migration

1. Keep local state authoritative until authentication succeeds.
2. Create an account-scoped server record with version, updated time, and device mutation identifier.
3. Upload a validated local snapshot once, preserving watchlist order and IDs.
4. Merge collections by stable identity; never silently discard local groups, theses, seen state, or briefs.
5. Present conflicts that cannot be merged safely.
6. Persist the migration receipt locally, then enable incremental sync.
7. Remain usable offline and queue bounded idempotent mutations.

## Security model

- Every user table requires RLS keyed to the authenticated user.
- Service-role credentials remain server-only.
- Validate size, symbols, timestamps, record counts, and ownership at the server boundary.
- Encrypt transport, minimize stored fields, support sign-out and eventual account deletion/export.
- Define retention and deletion semantics before collecting account data.

Authentication, OAuth UI, email flows, cloud writes, and account deletion are not implemented here.
