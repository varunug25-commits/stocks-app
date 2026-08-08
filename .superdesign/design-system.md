# MarketBrief Premium Consumer-Finance Design System

## Authority

This file translates the written MarketBrief Design Authority and Premium Product UI/UX Requirements into a buildable mobile system. It is the primary visual specification.

Bloomberg screenshots are permitted only as references for financial density, hierarchy, scanning and source-forward information architecture. Do not reproduce Bloomberg branding, layouts, iconography or visual styling. Do not use AI-generated image references or generic fintech mockup aesthetics.

## Product

MarketBrief answers: My stocks → what changed → why → what matters next.

The product is a serious, personalized consumer-finance information surface. It is not a trading terminal, market-news clone, AI dashboard, chatbot, brokerage, portfolio tracker or decorative glassmorphism concept. AI has no visual identity in this milestone and Milestone 7 is out of scope.

Primary screens:
- Today: personal, prioritized, watchlist-first.
- Markets: objective, dense, data-first.
- Watchlist: fast scanning and lightweight edit mode.
- Briefs: editorial intelligence publication.
- Stock Detail: evidence, company context and real provider data.
- Profile: compact personalization utility.

## Visual foundation

- App canvas: near-black #050708 to #07090A, never flat pure black across every layer.
- Base surface: charcoal near #0D1113.
- Raised opaque fallback: #13191C.
- Selected glass fill: dark neutral with roughly 82–92% opacity.
- Hairline: low-opacity white, approximately rgba(255,255,255,0.10).
- Primary text: warm white near #F4F1E8.
- Secondary text: cool gray near #9AA5A8.
- Tertiary/source metadata: muted gray near #687378.
- Brand accent: restrained teal #42E8C6, used for active navigation, selected controls and important actions.
- Positive financial movement: green #49D98A, never teal.
- Negative financial movement: red #FF6B74.
- Catalyst/warning: amber #F2B84B.
- Neutral information is white/gray; restrained blue is allowed only for a clear semantic reason.

No neon, rainbow gradients, giant glow, ornamental orbit graphics, arbitrary score visuals or broad green/teal washes.

## Glass policy

Glass is an accent, not the layout system.

Allowed:
- bottom navigation
- compact header controls
- segmented controls
- sheets/modals
- a single selected/hero summary module
- contextual floating action when needed

Disallowed:
- every row
- every story
- every filing
- nested cards
- long-form article containers
- full-screen translucent layers

Every glass surface must remain premium with blur disabled. Use an opaque Android fallback, a thin low-opacity border, little or no shadow, and strong text contrast. Never stack expensive blur layers.

## Typography and numbers

Use the existing native system sans-serif stack. Do not introduce serif, decorative or AI-styled display fonts.

Target hierarchy:
- Screen title: 27–29px / 32–35px, bold. Reduce current oversized 34px headings.
- Primary financial number: 30–36px, bold, tabular numerals where supported.
- Section title: 18–20px, bold.
- Row symbol/price: 15–17px, semibold/bold.
- Body: 15–16px / 21–23px.
- Metadata/source: 11–13px / 15–17px.
- Eyebrows: compact uppercase only when they identify a meaningful section; avoid repeated decorative labels.

Financial values outrank prose. Align numeric columns and use tabular numerals where feasible. Source and freshness stay visible but quiet.

## Spacing, geometry and density

Use a 4px base rhythm. Primary horizontal page inset: 18–20px. Prefer 12–20px section gaps over large empty blocks.

- Routine rows: 58–72px.
- Touch target: minimum 44px.
- Routine radius: 8–12px.
- Selected glass/segmented surfaces: 12–16px.
- Modal/sheet corners: 24–28px.
- Hairline separators replace most card borders.
- Shadows are rare and subtle.
- Approximately five useful watchlist rows should fit a typical Android viewport.
- Today must expose watchlist status and at least one meaningful development above the fold.
- Markets must show useful data above the fold.
- Profile should use roughly 40–60% less vertical space than the current card-heavy form.

## Component grammar

### GlassSurface
Dark translucent/opaque-fallback surface for navigation, sheets, selected controls and at most one signature summary module. Thin white hairline, no glow.

### Hairline
Full-width or inset separator with low-opacity white. Default structure for financial and editorial lists.

### CompactSectionHeader
Title plus optional source/freshness/action. Minimal vertical footprint.

### CompactFinanceRow
Left: logo/monogram plus ticker/company/context. Right: price and semantic daily move. Optional tiny real sparkline. Rows are separated, not individually carded.

### SourceFreshness
Compact metadata such as “Twelve Data · Updated 2m ago” or “SEC · Jul 31”. Provider errors remain local with a concise Retry action.

### EditorialRow
Optional permitted thumbnail, headline, publisher, time and related symbol/context. No fabricated imagery or URLs.

### SemanticValue
Positive is green, negative red, warning amber, neutral warm white/gray. Brand teal never substitutes for financial meaning.

## Screen rules

### Today
Header: MarketBrief, date/context and search.

Order:
1. Watchlist Today: up/down summary, freshness and a ranked subset of important shared-watchlist movers.
2. What Changed: factual/provider-backed developments and clearly labelled illustrative interpretation only where it already exists.
3. Next Up: watchlist-relevant earnings/events.
4. Compact Morning/Evening Brief entry.
5. Secondary supported context.

Remove/de-emphasize the giant generic Market Pulse, arbitrary mood imagery, decorative editorial hero and primary global provider banners. A user should understand “what happened to my stocks?” in five seconds.

### Markets
Title and compact supported tabs: Overview, Indices, Movers, Earnings. Do not expose unsupported or fabricated categories.

Use a compact market-at-a-glance module and dense financial rows. Remove Market Mood because it has no documented methodology. If market-wide movers cannot be supported truthfully, label the section Watchlist Movers. News uses dense source-forward editorial rows with permitted imagery only.

### Watchlist
Header: Watchlist, Add and Edit/Done. Show count and compact freshness; hide plan-limit copy until the limit matters.

Default rows show ticker, company, price, daily move and relevant catalyst. No always-visible move/remove controls. Edit mode exposes reorder and removal with native-feeling controls and accessible labels.

### Briefs
Typography-led Morning/Evening publication. Latest brief uses edition, time, headline, short dek and clean preview sections. Avoid a giant AI card.

Brief detail is a linear editorial article with numbered sections, hairlines, confirmed/interpretation/uncertainty structure, sources and next catalysts. No giant outer card.

### Stock Detail
Preserve M6 behavior exactly: real Twelve Data quote/chart, Finnhub news/events, SEC filings, freshness, external links, stale/error states, latest-10 presentation and chart-only range changes.

Order:
1. ticker/company
2. price and daily move
3. market/source/freshness
4. chart and range
5. clearly labelled illustrative Why It Moved
6. events
7. latest news
8. latest filings
9. sources

Use editorial sections and separators, not a card around every section.

### Profile
Compact settings/navigation rows under Personalization and Utility. Experience, goals, interests and watchlist are concise summaries with chevrons. Notifications, Data & Sources, Appearance, Privacy and About follow as simple rows. No giant preference cards.

### Navigation
Keep Today, Markets, Watchlist, Briefs, Profile. Thin crisp bottom treatment with restrained active teal/white. No AI tab and no glowing selected bubble.

## Motion and accessibility

Use quick crossfades, restrained press scale, segmented transitions, chart transitions and bottom-sheet motion. Respect reduced motion. Avoid continuous decorative animation and excessive springs.

Preserve font scaling, 44px touch targets, screen-reader labels, focus states and semantic roles. Glass must not reduce contrast. Optimize lists and avoid stacked blur for Android performance.

## Truth and scope

Never add fake users, fabricated market data, arbitrary scores, trading, predictions, recommendations, holdings, community or AI chat. Demo mode remains honest but compact. Provider failures are local. Source metadata is never removed or silently altered. Milestone 7 AI is not part of this redesign.

## Rejection criteria

Reject and revise a draft if:
- it resembles a generic AI-generated fintech mockup;
- more than half the visible content is inside rounded cards;
- decorative UI outranks stock data;
- glass or glow is required for quality;
- provider/debug explanation appears before useful information;
- watchlist controls are permanently visible;
- Market Mood remains;
- Today is generic-index-first;
- screens appear to belong to different products;
- green and teal are confused;
- negative moves are not immediately red;
- generated imagery is used as visual authority.

Use ONLY the fonts, colors, spacing and component styles defined here and in the repository token context. Do not introduce unrelated fonts, colors or visual styles.
