export const colors = {
  background: "#050708",
  surface: "#0D1113",
  surfaceElevated: "#13191C",
  surfaceSoft: "#182024",
  border: "#293236",
  borderSoft: "#1B2326",
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
  textSecondary: "#9AA5A8",
  textTertiary: "#6F7B7F",
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
  xxl: 24,
  xxxl: 28,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  hero: 20,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 30, lineHeight: 35, fontWeight: "700" as const },
  title: { fontSize: 27, lineHeight: 32, fontWeight: "700" as const },
  heading: { fontSize: 19, lineHeight: 24, fontWeight: "700" as const },
  body: { fontSize: 15, lineHeight: 21, fontWeight: "400" as const },
  label: { fontSize: 15, lineHeight: 19, fontWeight: "600" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "500" as const },
} as const;

export const numerals = {
  fontVariant: ["tabular-nums"] as "tabular-nums"[],
} as const;

export const glass = {
  fallback: "#101719E8",
  fallbackStrong: "#11191CF2",
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
