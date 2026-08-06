import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { Driver } from "@/data/stocks";
import { colors, spacing, typography } from "@/theme/tokens";
export function DriverRow({ driver }: { driver: Driver }) {
  const positive = driver.tone === "positive";
  return (
    <View style={s.row}>
      <Ionicons
        color={positive ? colors.positive : colors.negative}
        name={positive ? "arrow-up-circle" : "alert-circle"}
        size={22}
      />
      <View style={s.copy}>
        <View style={s.top}>
          <Text style={s.title}>{driver.title}</Text>
          <Text style={s.tag}>{driver.fact ? "FACT" : "INTERPRETATION"}</Text>
        </View>
        <Text style={s.detail}>{driver.detail}</Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  copy: { flex: 1 },
  top: { flexDirection: "row", gap: spacing.xs },
  title: { ...typography.label, flex: 1, color: colors.textPrimary },
  tag: {
    ...typography.caption,
    fontSize: 9,
    color: colors.teal,
    letterSpacing: 0.7,
  },
  detail: { ...typography.caption, color: colors.textSecondary, marginTop: 3 },
});
