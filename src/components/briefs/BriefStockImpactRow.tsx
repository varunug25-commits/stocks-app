import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BriefStockImpact } from "@/data/briefs";
import { CompanyLogo } from "@/components/finance/CompanyLogo";
import { companyBySymbol } from "@/data/stocks";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function BriefStockImpactRow({ impact, onPress }: { impact: BriefStockImpact; onPress: () => void }) {
  const positive = impact.direction === "up";
  const company = companyBySymbol[impact.symbol];
  return (
    <Pressable
      accessibilityLabel={`Open ${company.name} stock detail, ${positive ? "up" : "down"} ${Math.abs(impact.changePercent).toFixed(2)} percent, ${impact.impact} impact`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <CompanyLogo color={company.logoColor} name={company.name} size={44} symbol={impact.symbol} />
      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <Text style={styles.symbol}>{impact.symbol}</Text>
          <Text style={[styles.change, { color: positive ? colors.positive : colors.negative }]}>
            {positive ? "▲" : "▼"} {positive ? "+" : "−"}{Math.abs(impact.changePercent).toFixed(2)}%
          </Text>
        </View>
        <Text numberOfLines={2} style={styles.reason}>{impact.reason}</Text>
        <Text style={styles.next}>{impact.impact} impact · Next: {impact.nextCatalyst}</Text>
      </View>
      <Ionicons color={colors.textTertiary} name="chevron-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 112, flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: .72 },
  copy: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.xs },
  symbol: { ...typography.label, color: colors.textPrimary },
  change: { ...typography.label },
  reason: { ...typography.caption, color: colors.textSecondary, marginTop: 3 },
  next: { ...typography.caption, color: colors.warning, marginTop: spacing.xs },
});
