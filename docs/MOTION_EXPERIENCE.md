# MarketBrief premium motion experience

## Starting point and scope

- Starting head: `f394425e1afdbccf3e90d83481a0e88d21d615e8`.
- Dedicated branch: `codex/premium-motion-experience`.
- User requests a stronger visual result and visible, polished animation.
- Implement inside the existing React Native architecture. No external design extension, dependency upgrade, provider change, AI behavior change, or merge.

## Visual direction

An editorial market instrument: near-black canvas, warm-white editorial type, solid charcoal financial surfaces, restrained teal selection, and signed green/red movement. Today stays personal-watchlist first, with a compact factual breadth lead and a horizontal rail of the three meaningful movers. A compact quiet/baseline state avoids repeating large empty prose. Existing evidence, next events, publication and Ask destinations remain intact.

Original abstract publication artwork supports the reading experience. It is not a UI mockup, documentary news photograph, market chart, or evidence. Do not manufacture portfolio balances, market-wide values, live streaming, or real-data sparklines.

## Motion contract

- Press: short 0.975–0.985 scale compression and a damped spring release; keep labels readable and actions immediately available.
- Tabs: a measured selection indicator slides to the active destination; icons settle once, never bounce continuously. Labels and accessibility selection remain available.
- Segments: selection surfaces slide in about 220ms. Checked state changes immediately. Chart range changes continue to request bars only.
- Chart: reveal the genuine normalized path once per dataset/range; no fabricated price tweening or morphing between unrelated arrays. Exact quote remains literal.
- Content: short bounded entrance/crossfade; total stagger stays below 120ms. No waiting for a whole-page spectacle.
- Sheets: visible open and close transitions, safe dismissal, and static reduced-motion behavior.
- Loading: restrained skeleton pulse with animation cleanup, no blank loading screens.
- Reduced motion: no spatial travel, no scale compression, no animated chart reveal, and static skeletons. Controls remain fully functional.
- Haptics: meaningful activation/selection only. Never claim native haptic or frame-rate verification from a web recording.

## Implementation and verification

Use reusable motion primitives and shared timings. Preserve five tabs, persisted membership/order, real/demo separation, sources, timestamp semantics, errors and retry actions. Verify 390×844 and 320×844, all tab destinations, search/add/edit/reorder/remove, chart ranges, brief editions/save, and reduced-motion states. Capture real app screenshots plus a short interaction recording; do not present generated UI imagery as implementation evidence.

Before commits run typecheck, lint, tests and startup. Final checks also include production web export and existing function checks. Native Android/iPhone verification remains separate and must not be claimed unless performed.

## Known pre-existing limitations

The ten-company DEMO catalogue does not safely generate illustrative briefs for imported unsupported symbols. This visual/motion pass does not expand the demo stock universe or change backend/AI logic. Existing Expo patch-version warnings are not silently fixed as part of design work.

## Results

### Delivered

- Added shared press, selection and measured-width motion primitives without changing the navigation, screen or provider architecture.
- Applied short press feedback, a measured sliding tab dock and segmented selection, a true-path chart reveal, chart-direction and date labels based on the selected plotted range, visible sheet transitions, and restrained loading skeleton motion.
- Reduced-motion settings remove spatial/scale movement and chart reveal while leaving controls usable.
- Today now uses a compact watchlist-first summary and horizontal mover rail before the remaining editorial content.
- Added original abstract publication artwork at `assets/editorial/signal-original-v2.jpg`. It is original decorative publication artwork, not a news photograph, mock interface, chart, or data source.
- Corrected illustrative chart timestamps so each DEMO range spans its advertised duration and ends at the fixed illustrative session timestamp. This does not alter provider-backed/REAL resources or imply current live data.

### Verification

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 211 tests.
- `npm run functions:check`: passed for the existing `market-data`, `market-intelligence`, and `product-events` functions.
- `EXPO_OFFLINE=1 npx expo export --platform web --output-dir /tmp/marketbrief-production --max-workers 2`: passed; exported 40 static routes.
- Mobile-web interaction review: passed 32 checks at 390×844 and 320×844 where applicable. Covered five tabs, watchlist ordering/add/remove/empty/error states, search, briefs, chart range/reveal, reduced-motion behavior, and animated selection/press/sheet interactions. Updated screenshots and a 10-second interaction recording are under `docs/screenshots/premium-motion/`.
- `npm run doctor`: 20/21 checks passed. The only failure is the existing Expo SDK patch-version mismatch across 12 packages; dependencies were not upgraded in this focused motion pass.
- `app.json` retains its original static web output setting; temporary preview configuration was reverted.

### Evidence and limitations

- `docs/screenshots/premium-motion/review-results.json` records the DEMO-mode checks, no-overflow results, and explicit `nativeDeviceVerification: false` / `realProviderVerification: false` flags.
- Preview screenshots are intentionally DEMO data. No native Android/iPhone validation or real-provider verification was performed; no claim of native haptic behavior or native frame-rate performance is made.
- The existing DEMO catalogue still has ten companies and does not provide illustrative briefs for arbitrary imported symbols outside that catalogue. The tested five-stock watchlist flows remain within supported coverage.
- No AI, backend, authentication, payment, API, secret, or M7 behavior was added or changed.
