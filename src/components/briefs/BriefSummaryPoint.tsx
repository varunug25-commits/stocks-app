import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function BriefSummaryPoint({ point, index }: { point: string; index: number }) {
  return (
    <View style={styles.row}>
      <View style={styles.number}>
        <Text style={styles.numberText}>{index + 1}</Text>
      </View>
      <Text style={styles.text}>{point}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  number: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    backgroundColor: colors.tealMuted,
  },
  numberText: { ...typography.caption, color: colors.teal },
  text: { ...typography.body, flex: 1, color: colors.textSecondary },
});
