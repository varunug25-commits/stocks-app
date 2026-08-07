import { StyleSheet, Text, View } from "react-native";
import type { DataMode } from "@/data/real";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function DataModeBanner({ mode }: { mode: DataMode }) {
  return (
    <View accessibilityRole="text" style={[styles.banner, mode === "REAL" ? styles.real : styles.demo]}>
      <Text style={styles.title}>{mode === "REAL" ? "Real data mode" : "Demo data mode"}</Text>
      <Text style={styles.body}>
        {mode === "REAL"
          ? "Provider failures stay unavailable—MarketBrief never substitutes demo prices."
          : "All prices and market content on this screen are illustrative fixtures."}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  banner: { padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, marginBottom: spacing.md },
  real: { backgroundColor: "#102824", borderColor: "#24594F" },
  demo: { backgroundColor: "#292317", borderColor: "#5A4923" },
  title: { ...typography.label, color: colors.textPrimary },
  body: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
