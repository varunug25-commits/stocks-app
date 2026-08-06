import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export function ConfidenceIndicator({
  level,
}: {
  level: "High" | "Medium" | "Low";
}) {
  const count = level === "High" ? 3 : level === "Medium" ? 2 : 1;
  return (
    <View accessibilityLabel={`${level} confidence`} style={s.row}>
      <View style={s.bars}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={[s.bar, item <= count && s.active]} />
        ))}
      </View>
      <Text style={s.text}>{level} confidence</Text>
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  bars: { flexDirection: "row", gap: 3 },
  bar: {
    width: 5,
    height: 13,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  active: { backgroundColor: colors.warning },
  text: { ...typography.caption, color: colors.warning },
});
