# MarketBrief Mobile Design System

## Product identity

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
| App background | `background` | `#070809` |
| Financial surface | `surface` | `#0E1012` |
| Elevated surface | `surfaceElevated` | `#141619` |
| Soft surface | `surfaceSoft` | `#191C20` |
| Border | `border` | `#25292E` |
| Soft border | `borderSoft` | `rgba(255,255,255,0.08)` |
| Primary action | `accent` | `#F5F5F2` |
| Positive market state | `positive` | `#2FD17B` |
| Negative market state | `negative` | `#F05252` |
| Attention / uncertainty | `warning` | `#E8A93A` |
| Rare information state | `info` | `#6698FF` |
| Primary text | `textPrimary` | `#F5F5F2` |
| Secondary text | `textSecondary` | `#A3A6AA` |
| Tertiary text | `textTertiary` | `#6C7075` |
| Disabled surface | `disabled` | `#25282C` |
| Disabled text | `disabledText` | `#666A70` |

The interface is approximately 85–90% monochrome. Green and red are reserved for financial movement or matching semantic success/error states. Amber indicates uncertainty, upcoming events, or attention. Blue is rare informational context. Primary actions and selected navigation use near-white—not green. Color is always paired with a sign, arrow, icon, or label.

Legacy `teal` token names remain temporary compatibility aliases to the monochrome action system while components migrate; they no longer render teal.

## Typography

Use platform system fonts for native rendering and accessibility. All prices and aligned financial numbers use tabular numerals.

| Style | Size / line height | Weight |
| --- | --- | --- |
| Display | 30 / 35 | 700 |
| Screen title | 27 / 32 | 700 |
| Section heading | 19 / 24 | 700 |
| Body | 15 / 21 | 400 |
| Label | 15 / 19 | 600 |
| Caption | 12 / 16 | 500 |

Avoid all caps except short section eyebrows, evidence states, and status micro-labels. Important text must remain usable with large accessibility font sizes.

## Spacing and radius

- Base scale: 4, 8, 12, 16, 20, 24, 32, 40.
- Screen horizontal gutter: 20.
- Section separation: 24–32.
- Financial row: 60–68, never below a 44-point interaction target.
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

Today is a change report. It leads with “Since you last checked,” ranks material developments, acknowledges quiet holdings, shows known upcoming events, links the current grounded brief, and keeps Ask contextual.

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
