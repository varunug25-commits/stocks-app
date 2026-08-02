# Project Instructions

## MOBILE UI/UX REQUIREMENTS

This is a native mobile application, not a desktop dashboard adapted to mobile.

Design for iPhone and Android screens first.

Do not use:

- desktop sidebars
- dense tables
- tiny typography
- excessive multi-column layouts
- permanently visible filters
- compressed dashboard widgets
- generic admin-dashboard styling

Use:

- bottom tab navigation
- large touch targets
- full-width sections
- horizontal carousels
- swipe interactions
- bottom sheets
- native modals
- smooth transitions
- haptic feedback
- skeleton loading
- pull to refresh
- accessible typography
- progressive information disclosure

The visual quality should be comparable to polished consumer products such as Robinhood, Apple Stocks, Coinbase and leading modern finance applications, while remaining completely original.

Use company logos throughout search, watchlists, stock pages and alerts.

Use high-quality editorial imagery for important market stories and briefings. Only use images obtained through permitted APIs, official company media, licensed sources or original app artwork. Do not scrape copyrighted images.

Create an original dark design system with:

- near-black background
- dark raised surfaces
- teal primary accent
- green positive values
- red negative values
- amber warning states
- warm-white primary text
- muted secondary text

Use React Native Reanimated for subtle, purposeful animations. Use Expo Haptics for important interactions. Use smooth skeleton states rather than blank loading screens.

The home screen must feel like a personalized finance feed, not a control panel.

Before implementation, create:

- `docs/MOBILE_DESIGN_SYSTEM.md`
- `docs/SCREEN_ARCHITECTURE.md`
- `docs/COMPONENT_INVENTORY.md`
- `docs/IMAGE_AND_MEDIA_POLICY.md`

Build reusable components for:

- company logo
- market index card
- stock row
- story card
- editorial hero
- AI briefing card
- event card
- source citation
- empty state
- skeleton state
- bottom sheet
- subscription paywall

Use realistic mock data during the design phase. Do not connect external data APIs until the complete mobile design shell is stable.

## SAFE GIT-BASED DEVELOPMENT WORKFLOW

1. Never make the entire app in one uncontrolled change.
2. Keep the `main` branch stable and runnable.
3. Create a separate feature branch for each major phase.
4. Make small, meaningful commits after each working milestone.
5. Before every commit:
   - run TypeScript checks;
   - run lint;
   - run available tests; and
   - confirm the app starts successfully.
6. Do not knowingly commit broken code.
7. Use clear Conventional Commit-style messages, for example:
   - `feat: add mobile tab navigation`
   - `feat: build Today screen`
   - `fix: resolve watchlist rendering issue`
   - `docs: add product architecture`
8. Never commit `.env` files, API keys, private credentials, build artifacts, or `node_modules`.
9. Before starting a major feature, create a checkpoint commit.
10. After completing a feature, report the branch name, commit hash, files changed, tests run, and known limitations.
11. Do not merge into `main` until the feature builds and works.
12. If a change causes serious regressions, revert to the last stable commit instead of patching blindly.
13. Push commits to GitHub regularly so local work is backed up.
14. Ask before force-pushing, deleting branches, resetting hard, or rewriting Git history.
