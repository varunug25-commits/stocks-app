import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { MarketStatus } from "@/data/markets";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function MarketStatusBadge({ status }: { status: MarketStatus }) {
  const open = status.state === "open";
  return <View accessibilityLabel={`${status.label}. ${status.detail}`} style={[styles.badge, !open && styles.closed]}><Ionicons color={open ? colors.positive : colors.warning} name={open ? "radio-button-on" : "moon"} size={14} /><View><Text style={[styles.label, { color: open ? colors.positive : colors.warning }]}>{status.label}</Text><Text style={styles.detail}>{status.detail}</Text></View></View>;
}
const styles = StyleSheet.create({ badge: { alignSelf: "flex-start", minHeight: 44, flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radii.pill, backgroundColor: "#12281F", borderWidth: 1, borderColor: "#24543F" }, closed: { backgroundColor: "#2B2417", borderColor: "#5A4923" }, label: { ...typography.label }, detail: { ...typography.caption, color: colors.textTertiary } });
