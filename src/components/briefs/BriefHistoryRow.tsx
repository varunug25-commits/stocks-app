import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BriefHistorySeed, BriefStatus } from "@/data/briefs";
import { colors, spacing, typography } from "@/theme/tokens";
import { BriefStatusBadge } from "./BriefStatusBadge";

export function BriefHistoryRow({ brief, status, onPress }: { brief: BriefHistorySeed; status: BriefStatus; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`Open ${brief.type === "morning" ? "Morning Brief" : "Evening Recap"}, ${brief.headline}, ${brief.dateLabel}, ${status}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.icon}><Ionicons color={colors.teal} name={brief.type === "morning" ? "sunny-outline" : "moon-outline"} size={20} /></View>
      <View style={styles.copy}>
        <Text style={styles.label}>{brief.type === "morning" ? "Morning Brief" : "Evening Recap"}</Text>
        <Text numberOfLines={1} style={styles.title}>{brief.headline}</Text>
        <Text style={styles.meta}>{brief.dateLabel} · {brief.timestamp}</Text>
      </View>
      <BriefStatusBadge status={status} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 94, flexDirection: "row", alignItems: "center", gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  pressed: { opacity: .68 },
  icon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: colors.tealMuted },
  copy: { flex: 1 },
  label: { ...typography.caption, color: colors.teal },
  title: { ...typography.label, color: colors.textPrimary, marginTop: 2 },
  meta: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
});
