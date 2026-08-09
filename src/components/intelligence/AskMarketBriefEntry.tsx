import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme/tokens";

export function AskMarketBriefEntry({ label = "Ask MarketBrief", detail, onPress }: { label?: string; detail: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.icon}><Ionicons color={colors.teal} name="chatbox-ellipses-outline" size={19} /></View>
      <View style={styles.copy}><Text style={styles.label}>{label}</Text><Text style={styles.detail}>{detail}</Text></View>
      <Ionicons color={colors.teal} name="chevron-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  pressed: { opacity: .7 },
  icon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.tealMuted },
  copy: { flex: 1 },
  label: { ...typography.label, color: colors.textPrimary },
  detail: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
});
