import { StyleSheet, Text, View } from "react-native";
import type { StockStatistic } from "@/data/stocks";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export function MarketStatsGrid({ items }: { items: StockStatistic[] }) {
  return (
    <View accessibilityLabel="Key market statistics" style={s.grid}>
      {items.map((item) => (
        <View key={item.label} style={s.cell}>
          <Text style={s.label}>{item.label}</Text>
          <Text style={s.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  cell: {
    width: "48.5%",
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { ...typography.caption, color: colors.textTertiary },
  value: {
    ...typography.heading,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
});
