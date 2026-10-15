# MarketBrief Mobile Design System

## Product identity

The direct mobile UI refresh restores restrained teal actions, warmer neutral surfaces, larger financial values, recognizable bundled brand glyphs, and a watchlist-first Today. The palette and screen rules below supersede the earlier monochrome Product Core V2 treatment.

MarketBrief is a serious, fast, evidence-first mobile product. It should feel financial, minimal, editorial, calm, and trustworthy—not like a crypto app, neon AI concept, generic SaaS dashboard, or glassmorphism showcase.

The product should reveal what materially changed first, then progressively disclose calculations, evidence, and original sources. A useful screen may contain one important change or no material changes at all; the interface never adds filler to satisfy a layout.

## Principles

- Native first: respect safe areas, platform gestures, font scaling, reduced motion, and familiar mobile controls.
- Five-second scan: the most important change, number, and next action are immediately clear.
- Evidence underneath: concise defaults expand to reasons, sources, and original publications.
- REAL means real: missing provider resources remain unavailable and never become DEMO values.
- Touchable: every interactive target is at least 44 × 44 pt.
- Restrained: color and motion explain state rather than decorate it.

## Color tokens

| Role | Token | Value |
| --- | --- | --- |
| App background | `background` | `#0B0E11` |
| Financial surface | `surface` | `#12171C` |
| Elevated surface | `surfaceElevated` | `#1A2128` |
| Soft surface | `surfaceSoft` | `#202931` |
| Border | `border` | `#2B353E` |
| Soft border | `borderSoft` | `rgba(255,255,255,0.08)` |
| Primary action / teal | `accent`, `teal` | `#80DCC6` |
| Positive market state | `positive` | `#57D49B` |
| Negative market state | `negative` | `#FF858D` |
| Attention / uncertainty | `warning` | `#E8A93A` |
| Rare information state | `info` | `#6698FF` |
| Primary text | `textPrimary` | `#F3F1EA` |
| Secondary text | `textSecondary` | `#ACB6BF` |
| Tertiary text | `textTertiary` | `#8996A2` |
| Disabled surface | `disabled` | `#25282C` |
| Disabled text | `disabledText` | `#666A70` |

Most of the interface remains neutral. Green/red describe signed financial movement; amber describes uncertainty or attention. Teal identifies links, primary actions, and selected navigation. Brand glyphs may retain their brand treatment. Color is paired with a sign, arrow, icon, or label. Foreground and financial semantic tokens meet 4.5:1 contrast on all four primary opaque surfaces.

`accent` and `teal` intentionally share the same action color.

## Typography

Use platform system fonts for native rendering and accessibility. All prices and aligned financial numbers use tabular numerals.

| Style | Size / line height | Weight |
| --- | --- | --- |
| Display | 32 / 38 | 700 |
| Screen title | 30 / 36 | 700 |
| Section heading | 20 / 26 | 600 |
| Body | 15 / 23 | 400 |
| Label | 15 / 21 | 600 |
| Caption | 12 / 18 | 500 |

Avoid all caps except short section eyebrows, evidence states, and status micro-labels. Important text must remain usable with large accessibility font sizes.

## Spacing and radius

- Base scale: 4, 8, 12, 16, 20, 24, 32, 40.
- Screen horizontal gutter: 20.
- Section separation: 24–32.
- Today mover row: 76; Watchlist row: 88 with room for company identity and readable source metadata. All interaction targets remain at least 44 points.
- Card padding: 16–20.
- Radii: 8 small, 12 medium, 16 large, 20 hero, 999 pill.
- A section is not automatically a card. Prefer full-width rows and hairline separators for dense financial information.

## Surfaces, glass, and elevation

Normal financial information uses solid dark surfaces. Glass is limited to bottom navigation, modal sheets, selected floating controls, and at most one justified hero surface. Glass uses a dark neutral translucent fill, subtle blur, a low-opacity white border, an opaque Android fallback, minimal shadow, and no glow.

## Motion and haptics

- Fast: 160 ms.
- Standard: 260 ms.
- Deliberate: 420 ms.
- Use motion for navigation, expansion, sheets, change acknowledgement, and meaningful state transitions.
- Respect reduced-motion settings everywhere.
- Haptics accompany deliberate selections, saves, acknowledgement, and significant success/warning states.
- No decorative floating motion.

## Core screen application

Today leads with three important shared-watchlist movers, directional counts, prices, and freshness. “Since you last checked” follows with genuine material developments or a compact first-baseline/quiet state. Upcoming events, the current brief, and contextual Ask follow. Quiet states do not repeat a second redundant quiet-stock panel.

Pulse summarizes the watchlist: breadth, unusual moves, concentration, shared evidence, and upcoming events. It does not display invented indices, sectors, or macro values.

Stock Detail uses a chronological evidence timeline. Exact intraday times appear only when the provider supplies them. Why It Moved uses evidence-state language—not numeric confidence—and every material AI claim can open its supporting evidence.

Briefs remain short and editorial. Original generated artwork may support publication identity, but it never depicts or implies a real photographed market event and never substitutes for source evidence.

## Loading, empty, error, and stale states

- Never show a blank screen or one generic spinner.
- Skeletons mirror Today changes, Stock timeline, Brief rows, and Ask response sections.
- Preserve useful partial content when one provider fails.
- Differentiate network, provider, AI, unsupported symbol, stale data, rate limit, and configuration errors.
- First snapshot: “Your baseline is ready.”
- Empty watchlist: “Follow a few companies. MarketBrief will track what changes and filter out the noise.”
- Quiet result: “Nothing material changed.”
- Stale resources show truthful freshness and are never restyled as fresh.

## Accessibility

- Minimum target: 44 × 44 pt.
- Logical screen-reader order and semantic roles.
- Every icon-only action has a clear accessibility label.
- Gain/loss always includes direction and sign, not color alone.
- Charts expose concise text summaries.
- Sheets manage focus and expose dismissal.
- Swipe and long press always have an explicit alternative.
- Contrast and hierarchy remain usable on ordinary Android screens and at increased font size.

## Image and media use

Original artwork may be generated for publication identity, onboarding atmosphere, or neutral editorial context. It must be locally stored, optimized, and labelled as artwork where confusion is possible. Never generate fake documentary photographs of a real company event, executive, filing, or breaking-news scene. Provider/company logos and licensed editorial media retain their actual source and attribution. Video must be supplied or properly licensed, compressed for mobile, optional to the core flow, and never autoplay with sound.
