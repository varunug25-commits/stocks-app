import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme/tokens";

export function BriefSummaryPoint({ point, index }: { point: string; index: number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.numberText}>{String(index + 1).padStart(2, "0")}</Text>
      <Text style={styles.text}>{point}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, paddingVertical: spacing.xs },
  numberText: { ...typography.label, width: 26, color: colors.textSecondary },
  text: { ...typography.body, flex: 1, color: colors.textSecondary },
});
