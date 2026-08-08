# Theme and Design Tokens

## Compact token summary

- Framework styling: React Native `StyleSheet`; no CSS, Tailwind or CSS Modules.
- Background: `#070B0D`; base surface: `#0E1518`; elevated: `#141D21`; soft surface: `#192428`.
- Brand accent: teal `#42E8C6`; pressed `#2CC9AA`; muted teal surface `#12372F`.
- Financial semantics: positive `#49D98A`, negative `#FF6B74`, warning `#F2B84B`.
- Text: primary warm white `#F4F1E8`, secondary cool gray `#98A6A9`, tertiary `#637176`.
- Borders: `#223036` / soft `#172226`.
- Spacing: 4, 8, 12, 16, 20, 24, 28, 36.
- Radii: 12, 18, 22, 26, pill. Current redesign intent is to reduce routine radii and reserve stronger rounding for selected glass/sheets.
- Type scale: display 34/39, title 26/32, heading 20/26, body 16/23, label 14/19, caption 12/16.
- Motion: 160ms fast, 260ms standard, 420ms deliberate. Reduced-motion support exists on animated screens.
- Current shadow: one floating shadow, opacity 0.28 and radius 24; redesign intent is to remove most routine shadow use.
- Breakpoints: no explicit breakpoints; mobile-first with centered content columns capped near 680px for web rendering.

## Raw source

```ts
export const colors = {
  background: "#070B0D",
  surface: "#0E1518",
  surfaceElevated: "#141D21",
  surfaceSoft: "#192428",
  border: "#223036",
  borderSoft: "#172226",
  teal: "#42E8C6",
  tealMuted: "#12372F",
  tealPressed: "#2CC9AA",
  focus: "#7BF4DC",
  disabled: "#263034",
  disabledText: "#6E797C",
  overlay: "#000000B8",
  positive: "#49D98A",
  negative: "#FF6B74",
  warning: "#F2B84B",
  textPrimary: "#F4F1E8",
  textSecondary: "#98A6A9",
  textTertiary: "#637176",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 36,
} as const;

export const radii = {
  sm: 12,
  md: 18,
  lg: 22,
  hero: 26,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 34, lineHeight: 39, fontWeight: "700" as const },
  title: { fontSize: 26, lineHeight: 32, fontWeight: "700" as const },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: "700" as const },
  body: { fontSize: 16, lineHeight: 23, fontWeight: "400" as const },
  label: { fontSize: 14, lineHeight: 19, fontWeight: "600" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "500" as const },
} as const;

export const shadows = {
  floating: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

export const motion = {
  fast: 160,
  standard: 260,
  deliberate: 420,
} as const;
```
