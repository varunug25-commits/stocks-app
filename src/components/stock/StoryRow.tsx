import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { StockStory } from "@/data/stocks";
import { colors, spacing, typography } from "@/theme/tokens";
export function StoryRow({ item }: { item: StockStory }) {
  return (
    <View style={s.row}>
      <View style={s.copy}>
        <Text style={s.title}>{item.title}</Text>
        <Text style={s.meta}>{item.published} · MarketBrief Editorial</Text>
      </View>
      <Ionicons color={colors.textTertiary} name="chevron-forward" size={18} />
    </View>
  );
}
const s = StyleSheet.create({
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  copy: { flex: 1 },
  title: { ...typography.label, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textTertiary, marginTop: 3 },
});
