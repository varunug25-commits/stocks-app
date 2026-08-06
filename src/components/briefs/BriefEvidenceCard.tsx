import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { BriefEvidence } from "@/data/briefs";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function BriefEvidenceCard({ item }: { item: BriefEvidence }) {
  const warning = item.kind === "UNCERTAINTY";
  return (
    <View style={[styles.card, warning && styles.warning]}>
      <View style={styles.labelRow}>
        <Ionicons color={warning ? colors.warning : colors.teal} name={warning ? "help-circle-outline" : item.kind === "FACT" ? "checkmark-circle-outline" : "git-compare-outline"} size={18} />
        <Text style={[styles.label, warning && styles.warningText]}>{item.kind}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  warning: { backgroundColor: "#292317", borderColor: "#5A4923" },
  labelRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  label: { ...typography.caption, color: colors.teal, letterSpacing: 1 },
  warningText: { color: colors.warning },
  title: { ...typography.heading, color: colors.textPrimary, marginTop: spacing.md },
  body: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
});
