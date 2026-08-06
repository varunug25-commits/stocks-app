import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CompanyLogo } from "@/components/finance/CompanyLogo";
import type { SearchStock } from "@/data/search";
import { colors, spacing, typography } from "@/theme/tokens";

export function SearchResultRow({ stock, onPress }: { stock: SearchStock; onPress: () => void }) {
  const positive = stock.changePercent >= 0;
  return <Pressable accessibilityLabel={`Open ${stock.name} preview`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><CompanyLogo color={stock.logoColor} name={stock.name} symbol={stock.symbol} /><View style={styles.copy}><Text style={styles.symbol}>{stock.symbol}</Text><Text numberOfLines={1} style={styles.meta}>{stock.name} · {stock.sector}</Text></View><View style={styles.value}><Text style={styles.price}>{stock.price}</Text><Text style={[styles.change, { color: positive ? colors.positive : colors.negative }]}>{positive ? "+" : ""}{stock.changePercent.toFixed(2)}%</Text></View><Ionicons color={colors.textTertiary} name="chevron-forward" size={18} /></Pressable>;
}

const styles = StyleSheet.create({
  row: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  pressed: { opacity: .68 }, copy: { flex: 1 }, symbol: { ...typography.label, color: colors.textPrimary }, meta: { ...typography.caption, color: colors.textTertiary, marginTop: 2 }, value: { alignItems: "flex-end" }, price: { ...typography.label, color: colors.textPrimary }, change: { ...typography.caption, marginTop: 2 },
});
