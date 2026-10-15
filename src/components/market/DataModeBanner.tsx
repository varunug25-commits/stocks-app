import { StyleSheet, Text, View } from "react-native";
import type { DataMode } from "@/data/real";
import { colors, spacing, typography } from "@/theme/tokens";

export function DataModeBanner({ mode }: { mode: DataMode }) {
  return (
    <View accessibilityRole="text" style={styles.banner}>
      <Text style={styles.body}>{mode === "REAL" ? "Company data · Source and update time shown with each resource" : "Demo data · Prices and stories are illustrative"}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  banner: { paddingVertical: spacing.xs, marginBottom: spacing.xs },
  body: { ...typography.caption, color: colors.textTertiary },
});
