import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import type { FilingData } from "@/data/real";
import { presentFiling } from "@/data/real";
import { colors, spacing, typography } from "@/theme/tokens";
export function FilingRow({ item }: { item: FilingData }) {
  const filing = presentFiling(item);
  const content = (
    <>
      <View style={s.form}>
        <Text style={s.formText}>{filing.form}</Text>
      </View>
      <View style={s.copy}>
        <Text style={s.title}>{filing.title}</Text>
        <Text style={s.meta}>{filing.filedAt} · {filing.source}{filing.canonicalUrl ? " · Official filing" : ""}</Text>
      </View>
      <Ionicons color={colors.textTertiary} name={filing.canonicalUrl ? "open-outline" : "document-text-outline"} size={20} />
    </>
  );
  if (filing.canonicalUrl) {
    return (
      <Pressable
        accessibilityLabel={`Open official ${filing.form} filing from ${filing.source}`}
        accessibilityRole="link"
        onPress={() => void Linking.openURL(filing.canonicalUrl!)}
        style={({ pressed }) => [s.row, pressed && s.pressed]}
      >
        {content}
      </Pressable>
    );
  }
  return (
    <View
      accessibilityLabel={`${filing.form} ${filing.title}, ${filing.filedAt}, ${filing.source}`}
      style={s.row}
    >
      {content}
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
  pressed: { opacity: 0.68 },
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
