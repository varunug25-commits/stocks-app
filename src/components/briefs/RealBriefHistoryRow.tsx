import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RealBriefRecord } from "@/features/briefs/realStore";
import { colors, spacing, typography } from "@/theme/tokens";

export function RealBriefHistoryRow({ record, onPress }: { record: RealBriefRecord; onPress(): void }) {
  const date = new Date(record.generatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  return <Pressable accessibilityLabel={`Open ${record.edition} brief from ${date}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><View style={styles.copy}><Text style={styles.eyebrow}>{record.edition === "morning" ? "MORNING BRIEF" : "EVENING RECAP"} · {record.providerMode === "live" ? "LIVE" : "DETERMINISTIC"}</Text><Text numberOfLines={2} style={styles.title}>{record.headline}</Text><Text style={styles.meta}>{date} · {record.symbols.length} {record.symbols.length === 1 ? "company" : "companies"}</Text></View><Ionicons color={colors.textTertiary} name="chevron-forward" size={17} /></Pressable>;
}
const styles = StyleSheet.create({ row: { minHeight: 82, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, pressed: { opacity: .65 }, copy: { flex: 1 }, eyebrow: { ...typography.caption, color: colors.textTertiary }, title: { ...typography.label, color: colors.textPrimary, marginTop: 2 }, meta: { ...typography.caption, color: colors.textTertiary, marginTop: 3 } });
