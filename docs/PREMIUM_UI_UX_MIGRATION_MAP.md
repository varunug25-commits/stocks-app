# Premium UI/UX Migration Map

This audit is the pre-implementation migration map required by the MarketBrief Design Authority. It preserves the working M6 data architecture and changes visual structure only after design approval.

## KEEP

- Five-tab information architecture: Today, Markets, Watchlist, Briefs, Profile.
- Expo Router shell, safe-area structure, pull-to-refresh, haptics, Reanimated and bottom-sheet gesture behavior.
- Shared WatchlistProvider membership and ordering.
- MarketDataProvider contracts and all M6 backend/cache/provider behavior.
- Real Stock Detail quote, chart, news, events, filings, freshness, source links, latest-10 presentation and chart-only range fetching.
- Accessible roles, labels, error states, empty states and skeleton loading.
- CompanyLogo fallback identity, semantic positive/negative colors, source citations and compact provider freshness.
- Morning/evening Briefs concept and deterministic non-AI editorial content.

## REFINE

- Global tokens: slightly darker black/white foundation, tighter type hierarchy, smaller routine radii, softer hairlines and minimal shadows.
- BottomTabBar: thinner translucent treatment with opaque Android fallback and quieter selected state.
- SectionHeader: denser spacing and optional integrated source/freshness metadata.
- StockRow and WatchlistRow: stronger number hierarchy, aligned values and catalyst context.
- AppBottomSheet: restrained glass accent with no dependency on blur.
- ResourceStateNotice: quieter successful state and compact local failure/retry.
- SkeletonState: match the new dense screen structures.
- Stock Detail section spacing, chart surface and editorial lists without changing data loading behavior.
- Briefs hierarchy and fact/interpretation/uncertainty affordances without introducing AI.

## REPLACE

- Today’s generic market-dashboard order with watchlist-first “Watchlist Today → What Changed → Next Up → Brief” hierarchy.
- Markets concept-dashboard layout with supported compact tabs and finance-first rows.
- Watchlist Compact/Expanded toggle and permanent management buttons with one strong default view plus explicit Edit/Done mode.
- Profile’s giant preference cards with compact grouped settings rows.
- Card-heavy Brief home/detail structures with typography-led publication layouts.
- Repeated rounded section containers with hairlines, aligned rows and purposeful whitespace.
- Oversized headings with a compact editorial/financial scale.
- Large global data-mode explanations with small truthful source/freshness metadata.

## DELETE

- Market Mood and any arbitrary 68/100-style score lacking methodology.
- Large normal-flow “Real data mode / provider failures…” banners on customer screens.
- Giant generic Market Pulse and index-first prominence on Today.
- Decorative orbital/AI visual language, sparkle-led AI branding and broad gradients.
- Card-inside-card structures, routine pills, unnecessary shadows and debug/tool-looking controls.
- Always-visible Move Up, Move Down and Remove actions.
- Free-plan limit messaging before the user reaches the limit.
- Vague generic intro copy that does not help answer what changed for the user.
- Any generated image reference as design authority.

## Guardrails

Bloomberg references inform density, hierarchy and financial scanning only. They are not a source for branding or pixel reproduction. The written MarketBrief authority controls the visual system. M7 AI, chat, authentication, alerts and payments remain out of scope.
