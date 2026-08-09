import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { MaterialChange } from "@/features/materiality";
import { colors, numerals, spacing, typography } from "@/theme/tokens";

const actionFor = (kind: MaterialChange["kind"]) => kind === "filing" ? "View filing" : kind === "event" ? "View event" : kind === "news" ? "See evidence" : "Why it moved";

export function MaterialChangeRow({ change, index, onPress }: { change: MaterialChange; index: number; onPress: () => void }) {
  const direction = (change.movePercent ?? 0) > 0 ? "up" : (change.movePercent ?? 0) < 0 ? "down" : "unchanged";
  const tone = direction === "up" ? colors.positive : direction === "down" ? colors.negative : colors.textSecondary;
  return (
    <Pressable
      accessibilityLabel={`${change.symbol}. ${change.title}. ${actionFor(change.kind)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={styles.index}>{String(index + 1).padStart(2, "0")}</Text>
      <View style={styles.content}>
        <View style={styles.topLine}>
          <View style={styles.identity}>
            <Text style={styles.symbol}>{change.affectedSymbols.length > 1 ? change.affectedSymbols.join(" · ") : change.symbol}</Text>
            {change.movePercent !== null ? <Text style={[styles.move, { color: tone }]}>{direction === "up" ? "▲" : direction === "down" ? "▼" : "—"} {change.movePercent > 0 ? "+" : ""}{change.movePercent.toFixed(2)}%</Text> : null}
          </View>
          {change.moveLabel ? <Text style={[styles.label, change.moveLabel === "UNUSUAL MOVE" && styles.unusual]}>{change.moveLabel}</Text> : null}
        </View>
        <Text numberOfLines={2} style={styles.title}>{change.title}</Text>
        <View style={styles.reasons}>
          {change.reasons.slice(0, 3).map((reason) => <View key={reason} style={styles.reasonRow}><Text style={styles.bullet}>•</Text><Text style={styles.reason}>{reason}</Text></View>)}
        </View>
        <View style={styles.actionRow}>
          <Text style={styles.action}>{actionFor(change.kind)}</Text>
          <Ionicons color={colors.textPrimary} name="arrow-forward" size={16} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  pressed: { opacity: 0.68 },
  index: { ...numerals, ...typography.label, width: 26, color: colors.textTertiary },
  content: { flex: 1 },
  topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.xs },
  identity: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.xs, flex: 1 },
  symbol: { ...typography.label, color: colors.textPrimary },
  move: { ...numerals, ...typography.label },
  label: { ...typography.caption, color: colors.textSecondary, letterSpacing: 0.65 },
  unusual: { color: colors.warning },
  title: { ...typography.body, color: colors.textPrimary, marginTop: spacing.xs },
  reasons: { gap: 3, marginTop: spacing.xs },
  reasonRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs },
  bullet: { ...typography.caption, color: colors.textTertiary },
  reason: { ...typography.caption, flex: 1, color: colors.textSecondary },
  actionRow: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.xs },
  action: { ...typography.label, color: colors.textPrimary },
});
