import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { Catalyst } from "@/data/stocks";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export function CatalystCard({ item }: { item: Catalyst }) {
  const color =
    item.tone === "bull"
      ? colors.positive
      : item.tone === "risk"
        ? colors.negative
        : colors.warning;
  return (
    <View style={s.card}>
      <Ionicons
        color={color}
        name={
          item.tone === "bull"
            ? "trending-up"
            : item.tone === "risk"
              ? "shield-outline"
              : "calendar-outline"
        }
        size={22}
      />
      <View style={s.copy}>
        <Text style={[s.date, { color }]}>{item.date}</Text>
        <Text style={s.title}>{item.title}</Text>
        <Text style={s.detail}>{item.detail}</Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copy: { flex: 1 },
  date: { ...typography.caption },
  title: { ...typography.label, color: colors.textPrimary, marginTop: 2 },
  detail: { ...typography.caption, color: colors.textSecondary, marginTop: 3 },
});
