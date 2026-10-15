export const colors = {
  background: "#0B0E11",
  surface: "#12171C",
  surfaceElevated: "#1A2128",
  surfaceSoft: "#202931",
  border: "#2B353E",
  borderSoft: "#FFFFFF14",
  accent: "#80DCC6",
  accentPressed: "#60C5AD",
  info: "#6698FF",
  teal: "#80DCC6",
  tealMuted: "#193830",
  tealPressed: "#60C5AD",
  focus: "#A8EBD9",
  disabled: "#25282C",
  disabledText: "#666A70",
  overlay: "#000000B8",
  positive: "#57D49B",
  negative: "#FF858D",
  warning: "#E8A93A",
  textPrimary: "#F3F1EA",
  textSecondary: "#ACB6BF",
  textTertiary: "#8996A2",
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
  xxl: 32,
  xxxl: 40,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  hero: 20,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: "700" as const },
  title: { fontSize: 30, lineHeight: 36, fontWeight: "700" as const },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: "600" as const },
  body: { fontSize: 15, lineHeight: 23, fontWeight: "400" as const },
  label: { fontSize: 15, lineHeight: 21, fontWeight: "600" as const },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: "500" as const },
} as const;

export const numerals = {
  fontVariant: ["tabular-nums"] as "tabular-nums"[],
} as const;

export const glass = {
  fallback: "#1A2128E8",
  fallbackStrong: "#12171CF5",
  border: "#FFFFFF1A",
} as const;

export const shadows = {
  floating: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const motion = {
  fast: 160,
  standard: 260,
  deliberate: 420,
} as const;
