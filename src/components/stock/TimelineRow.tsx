import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import type { StockTimelineItem } from "@/features/timeline";
import { colors, spacing, typography } from "@/theme/tokens";

const iconByKind = { price: "analytics-outline", news: "newspaper-outline", filing: "document-text-outline", event: "calendar-outline" } as const;
const labelByKind = { price: "PRICE", news: "NEWS", filing: "SEC", event: "EVENT" } as const;

export function TimelineRow({ item }: { item: StockTimelineItem }) {
  const exactTime = item.precision === "instant" ? new Date(item.occurredAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "DATE ONLY";
  const tone = item.direction === "positive" ? colors.positive : item.direction === "negative" ? colors.negative : colors.textSecondary;
  const content = <>
    <View style={styles.rail}><Text style={styles.time}>{exactTime}</Text><View style={styles.marker}><Ionicons color={tone} name={iconByKind[item.kind]} size={16} /></View></View>
    <View style={styles.copy}><View style={styles.labelRow}><Text style={[styles.kind, item.kind === "price" && { color: tone }]}>{labelByKind[item.kind]}</Text><Text numberOfLines={1} style={styles.source}>{item.source}</Text></View><Text style={styles.title}>{item.title}</Text><Text numberOfLines={2} style={styles.detail}>{item.detail}</Text></View>
    {item.sourceUrl ? <Ionicons color={colors.textTertiary} name="open-outline" size={17} /> : null}
  </>;
  return item.sourceUrl ? <Pressable accessibilityLabel={`Open ${item.title} from ${item.source}`} accessibilityRole="link" onPress={() => void Linking.openURL(item.sourceUrl!)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>{content}</Pressable> : <View accessibilityLabel={`${labelByKind[item.kind]}, ${item.title}, ${item.source}`} style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  row: { minHeight: 84, flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  pressed: { opacity: 0.68 },
  rail: { width: 58, alignItems: "flex-start" },
  time: { ...typography.caption, color: colors.textTertiary, minHeight: 17 },
  marker: { width: 28, height: 28, marginTop: 4, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: colors.surfaceSoft },
  copy: { flex: 1 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  kind: { ...typography.caption, color: colors.textSecondary },
  source: { ...typography.caption, flex: 1, color: colors.textTertiary },
  title: { ...typography.label, color: colors.textPrimary, marginTop: 2 },
  detail: { ...typography.caption, color: colors.textSecondary, marginTop: 3 },
});
