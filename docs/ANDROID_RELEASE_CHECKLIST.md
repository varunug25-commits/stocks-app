# Android Release Checklist

Status: engineering checklist only. No Play Store publication is authorized by Product Core V2.

## Identity and build

- [x] Android package is `com.varun.marketbrief`.
- [x] Portrait orientation and predictive back are configured.
- [ ] Replace development signing with protected release credentials.
- [ ] Configure EAS production profile and version-code policy.
- [ ] Supply final adaptive icon, monochrome icon, notification icon, and splash assets.
- [ ] Produce an Android App Bundle and verify install/upgrade on supported API levels.
- [ ] Verify Expo SDK 57 and all native dependencies against the chosen Play target SDK at release time.

## Production configuration

- [x] Production defaults to REAL and fails closed unless REAL is explicitly selected.
- [x] Only the Supabase URL and publishable key may be present in Expo public configuration.
- [x] Market/AI provider credentials remain server-side secrets.
- [ ] Configure production Supabase project values in the build service; do not commit them.
- [ ] Apply reviewed database migrations and deploy reviewed Edge Functions.
- [ ] Verify REAL mode never silently substitutes DEMO content.

## Quality gate

- [ ] Typecheck, lint, tests, Edge Function checks, Expo Doctor, and production export pass on the release SHA.
- [ ] Complete the Android matrix in `docs/BETA_VALIDATION.md`, including small screen, 15-stock watchlist, font scaling, keyboard, back gesture, offline/stale data, resume, and deep links.
- [ ] Run startup, frame-time, memory, and image-loading checks on an ordinary Android device.
- [ ] Confirm all primary touch targets are at least 44×44, screen-reader labels are logical, and color is never the only market-movement cue.
- [ ] Confirm no developer menu, debug overlay, fixture terminology, credentials, or internal errors appear in the customer UI.

## Store and policy review — UNVERIFIED

- [ ] Privacy policy and data-safety form reviewed by qualified counsel — **UNVERIFIED**.
- [ ] Market-data, publisher-link, SEC, and AI-provider display/redistribution terms reviewed — **UNVERIFIED**.
- [ ] Financial-information disclaimer reviewed — **UNVERIFIED**.
- [ ] Content rating, target audience, support contact, deletion process, and store listing reviewed — **UNVERIFIED**.
- [ ] Production monitoring, incident response, rollback, and credential-rotation owners assigned.

Do not upload until every unchecked release-blocking item has an accountable owner and evidence.
