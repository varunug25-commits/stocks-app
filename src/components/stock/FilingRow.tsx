import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { Filing } from "@/data/stocks";
import { colors, spacing, typography } from "@/theme/tokens";
export function FilingRow({ item }: { item: Filing }) {
  return (
    <View
      accessibilityLabel={`${item.form} ${item.title}, ${item.filed}`}
      style={s.row}
    >
      <View style={s.form}>
        <Text style={s.formText}>{item.form}</Text>
      </View>
      <View style={s.copy}>
        <Text style={s.title}>{item.title}</Text>
        <Text style={s.meta}>{item.filed} · SEC</Text>
      </View>
      <Ionicons
        color={colors.textTertiary}
        name="document-text-outline"
        size={20}
      />
    </View>
  );
}
const s = StyleSheet.create({
  row: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  form: {
    width: 46,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft,
    borderRadius: 10,
  },
  formText: { ...typography.caption, color: colors.teal },
  copy: { flex: 1 },
  title: { ...typography.label, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textTertiary },
});
