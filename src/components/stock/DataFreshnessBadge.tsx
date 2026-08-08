import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export function DataFreshnessBadge({
  label = "DEMO · ILLUSTRATIVE",
}: {
  label?: string;
}) {
  return (
    <View accessibilityLabel={label} style={s.badge}>
      <Text style={s.text}>{label}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSoft,
  },
  text: { ...typography.caption, color: colors.textSecondary, letterSpacing: 0.7 },
});
