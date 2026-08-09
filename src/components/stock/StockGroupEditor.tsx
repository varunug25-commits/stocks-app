import { Pressable, StyleSheet, Text, View } from "react-native";
import type { WatchlistGroup } from "@/features/groups";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function StockGroupEditor({ groups, symbol, onToggle }: { groups: WatchlistGroup[]; symbol: string; onToggle(id: string): void }) {
  if (!groups.length) return <Text style={styles.empty}>Create a group in Profile, then assign this company to it.</Text>;
  return <View accessibilityLabel={`Groups for ${symbol}`} style={styles.wrap}>{groups.map((group) => { const selected = group.symbols.includes(symbol); return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={group.id} onPress={() => onToggle(group.id)} style={[styles.chip, selected && styles.selected]}><Text style={[styles.label, selected && styles.selectedLabel]}>{selected ? "✓ " : ""}{group.name}</Text></Pressable>; })}</View>;
}
const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.md, borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  selected: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  label: { ...typography.label, color: colors.textSecondary },
  selectedLabel: { color: colors.background },
  empty: { ...typography.body, color: colors.textTertiary },
});
