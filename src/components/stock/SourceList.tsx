import { StyleSheet, Text, View } from "react-native";
import type { SourceMetadata } from "@/data/stocks";
import { colors, spacing, typography } from "@/theme/tokens";
export function SourceList({ items }: { items: SourceMetadata[] }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item.id} style={s.row}>
          <Text style={s.name}>{item.name}</Text>
          <Text style={s.meta}>
            {item.kind} · {item.timestamp}
          </Text>
        </View>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  name: { ...typography.label, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
});
