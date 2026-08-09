import { StyleSheet, Text, View } from "react-native";
import type { MarketBriefIntelligenceResponse } from "@/data/intelligence";
import { deriveWhyEvidenceState } from "@/features/intelligence/whyEvidenceState";
import { colors, spacing, typography } from "@/theme/tokens";

export function WhyEvidenceState({ response }: { response: MarketBriefIntelligenceResponse }) {
  const assessment = deriveWhyEvidenceState(response);
  return <View accessibilityLabel={`${assessment.state}. Evidence strength ${assessment.strength}. ${assessment.explanation}`} style={styles.wrap}><View style={styles.row}><Text style={styles.state}>{assessment.state}</Text><Text style={styles.strength}>{assessment.strength} evidence</Text></View><Text style={styles.explanation}>{assessment.explanation}</Text></View>;
}
const styles = StyleSheet.create({ wrap: { paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, row: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }, state: { ...typography.label, flex: 1, color: colors.textPrimary }, strength: { ...typography.caption, color: colors.textTertiary }, explanation: { ...typography.caption, color: colors.textSecondary, marginTop: 3 } });
