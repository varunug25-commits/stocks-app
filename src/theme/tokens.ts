export const colors = {
  background: "#070809",
  surface: "#0E1012",
  surfaceElevated: "#141619",
  surfaceSoft: "#191C20",
  border: "#25292E",
  borderSoft: "#FFFFFF14",
  accent: "#F5F5F2",
  accentPressed: "#D7D7D2",
  info: "#6698FF",
  teal: "#F5F5F2",
  tealMuted: "#191C20",
  tealPressed: "#D7D7D2",
  focus: "#F5F5F2",
  disabled: "#25282C",
  disabledText: "#666A70",
  overlay: "#000000B8",
  positive: "#2FD17B",
  negative: "#F05252",
  warning: "#E8A93A",
  textPrimary: "#F5F5F2",
  textSecondary: "#A3A6AA",
  textTertiary: "#6C7075",
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
  fallback: "#141618B8",
  fallbackStrong: "#141618DB",
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
