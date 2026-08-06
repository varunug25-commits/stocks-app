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
