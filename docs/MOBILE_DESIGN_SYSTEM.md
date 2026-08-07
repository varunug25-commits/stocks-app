# MarketBrief Mobile Design System

## Phase 2 interaction tokens

- Focus ring: `#7BF4DC`, visually distinct from passive borders.
- Disabled surface/text: `#263034` / `#6E797C`.
- Pressed teal: `#2CC9AA`.
- Overlay: near-opaque black for modal focus.
- Motion durations: 160ms fast, 260ms standard, 420ms deliberate.

Motion is subtle, purposeful, and reduced when the platform requests reduced motion. Haptics accompany selection, primary actions, tab changes, and successful onboarding completion. Forms remain keyboard-safe, touch targets are at least 44 points, and selected states always pair color with an icon or state semantics.

## Design principles

MarketBrief should feel editorial, calm, and useful—not like a compressed trading terminal. Each screen reveals the most important information first and lets the user progressively open details.

- Native first: respect safe areas, platform gestures, and familiar mobile patterns.
- Glanceable: a user should understand the market tone within a few seconds.
- Trustworthy: show source labels, timestamps, and clear mock-state language.
- Touchable: interactive controls have at least a 44 × 44 pt target.
- Restrained: motion and color explain state; they are not decoration.

## Color tokens

| Role | Token | Value |
| --- | --- | --- |
| App background | `background` | `#070B0D` |
| Raised surface | `surface` | `#0E1518` |
| Elevated surface | `surfaceElevated` | `#141D21` |
| Hairline border | `border` | `#223036` |
| Primary accent | `teal` | `#42E8C6` |
| Accent wash | `tealMuted` | `#12372F` |
| Positive | `positive` | `#49D98A` |
| Negative | `negative` | `#FF6B74` |
| Warning | `warning` | `#F2B84B` |
| Primary text | `textPrimary` | `#F4F1E8` |
| Secondary text | `textSecondary` | `#98A6A9` |
| Tertiary text | `textTertiary` | `#637176` |

Color must never be the only indicator of gain, loss, or warning state. Pair it with a sign, label, or icon.

## Typography

Use the platform system font for native familiarity, predictable rendering, and accessibility.

| Style | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| Display | 34 / 39 | 700 | Greeting and major value |
| Title | 26 / 32 | 700 | Screen and hero titles |
| Heading | 20 / 26 | 700 | Section headings |
| Body | 16 / 23 | 400 | Main reading text |
| Label | 14 / 19 | 600 | Controls and metadata |
| Caption | 12 / 16 | 500 | Sources, timestamps, auxiliary data |

Support dynamic type where practical. Critical text must remain readable at 200% text size without horizontal scrolling.

## Spacing and shape

- Base spacing unit: 4 pt
- Screen gutter: 20 pt
- Section gap: 28 pt
- Card padding: 16–20 pt
- Compact card radius: 18 pt
- Hero card radius: 26 pt
- Pill radius: 999 pt
- Hairline border: 1 pt

Use generous vertical rhythm and full-width sections. Horizontal carousels may peek the next card to communicate scrollability.

## Elevation

Dark surfaces rely on tonal separation and borders more than heavy shadows. Use subtle shadow only for floating navigation, bottom sheets, and modals.

## Motion and haptics

- Use React Native Reanimated for entrance, press, sheet, and state-change transitions.
- Most transitions should last 160–280 ms.
- Respect reduced-motion preferences.
- Use light haptics for tab changes, saved-state toggles, and sheet detents.
- Use notification haptics only for meaningful success, warning, or failure events.

## Loading and empty states

- Never show a blank screen while content loads.
- Skeletons mirror the final layout and use a subtle moving highlight.
- Preserve page structure during refresh to avoid layout jumps.
- Empty states state what happened and offer one useful next action.

## Accessibility

- Minimum touch target: 44 × 44 pt.
- Primary text and controls target WCAG AA contrast.
- Every icon-only button has an accessibility label.
- Charts have concise text summaries.
- Lists expose item names, values, and changes as a single readable label.
- Do not rely on swipe as the only way to perform an action.

## Milestone 2 application

The discovery shell extends the near-black/teal system with horizontal index and sector rails, full-width mover lists, compact demo/timestamp metadata, amber closed/offline treatments, and bottom-sheet progressive disclosure. Five bottom tabs retain large touch targets and selected-state icon, text, and surface cues. Motion remains subtle; haptics support navigation, filters, refresh, and sheet dismissal.

## Milestone 3 application

Stock Detail prioritizes identity, price, and chart before explanation and supporting research. The chart uses green/red semantics plus a text summary and scrub value; range controls are large pills. Why It Moved uses labeled FACT, INTERPRETATION, and UNCERTAINTY blocks so visual hierarchy never overstates confidence. Watchlist management stays full-width, uses explicit controls in addition to gestures, and presents limits and destructive confirmation in bottom sheets or native modals.

## Milestone 4 application

Briefs use a calm editorial rhythm rather than dashboard widgets: a full-width edition selector, one prominent hero, compact history rows, and long-form detail sections. Morning uses teal/green atmospheric surfaces; Evening uses a restrained indigo tint while preserving the shared dark system. Source and disclosure text remains at caption scale with readable line height rather than tiny legal copy.

Status is communicated by words (`NEW`, `READ`, `SAVED`) and tonal pills. Evidence cards label `FACT`, `INTERPRETATION`, and `UNCERTAINTY`; amber is reserved for risk and missing-evidence states. Bottom-sheet filters keep controls progressive, Reanimated entrances respect reduced motion, Haptics support save interactions, and skeletons preserve layout during loading. Briefs intentionally omit pull-to-refresh while editions are deterministic local fixtures.
