import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { MarketStatus } from "@/data/markets";
import { colors, spacing, typography } from "@/theme/tokens";

export function MarketStatusBadge({ status }: { status: MarketStatus }) {
  const open = status.state === "open";
  return <View accessibilityLabel={`${status.label}. ${status.detail}`} style={styles.badge}><Ionicons color={open ? colors.textSecondary : colors.warning} name={open ? "radio-button-on" : "moon"} size={14} /><View><Text style={[styles.label, { color: open ? colors.textSecondary : colors.warning }]}>{status.label}</Text><Text style={styles.detail}>{status.detail}</Text></View></View>;
}
const styles = StyleSheet.create({ badge: { alignSelf: "flex-start", minHeight: 44, flexDirection: "row", alignItems: "center", gap: spacing.xs }, label: { ...typography.label }, detail: { ...typography.caption, color: colors.textTertiary } });
