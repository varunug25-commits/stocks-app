import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { GeneratedBrief } from "@/data/briefs";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function BriefMarketContext({ brief }: { brief: GeneratedBrief }) {
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Ionicons color={colors.teal} name="globe-outline" size={18} />
        <Text style={styles.label}>BROADER MARKET CONTEXT</Text>
      </View>
      <Text style={styles.direction}>{brief.marketDirection}</Text>
      <Text style={styles.body}>{brief.marketContext}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  labelRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  label: { ...typography.caption, color: colors.teal, letterSpacing: .8 },
  direction: { ...typography.heading, color: colors.textPrimary, marginTop: spacing.md },
  body: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
});
