import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MarketBriefIntelligenceResponse } from "@/data/intelligence";
import { responseFeedbackHash, useTelemetry } from "@/features/telemetry";
import { colors, radii, spacing, typography } from "@/theme/tokens";

const reasons = [["wrong", "Wrong"], ["not_relevant", "Not relevant"], ["too_obvious", "Too obvious"], ["too_much_text", "Too much text"], ["missing_context", "Missing context"]] as const;
export function IntelligenceFeedback({ response }: { response: MarketBriefIntelligenceResponse }) {
  const telemetry = useTelemetry();
  const [choice, setChoice] = useState<"yes" | "no" | "sent" | null>(null);
  const send = async (helpful: boolean, reason: string | null) => {
    const accepted = await telemetry.feedback({ responseHash: responseFeedbackHash({ generatedAt: response.generatedAt, sourceIds: response.sourceIds, task: response.meta.task }), task: response.meta.task, symbols: response.symbols, helpful, reason });
    if (accepted) { telemetry.track("feedback_submitted", { task: response.meta.task, outcome: helpful ? "helpful" : reason ?? "not_helpful" }); setChoice("sent"); }
  };
  if (choice === "sent") return <Text accessibilityLiveRegion="polite" style={styles.thanks}>Thanks. Feedback was recorded without your question or thesis text.</Text>;
  return <View style={styles.wrap}><Text style={styles.label}>Useful?</Text><View style={styles.actions}><Pressable accessibilityRole="button" onPress={() => void send(true, null)} style={styles.button}><Text style={styles.buttonText}>Yes</Text></Pressable><Pressable accessibilityRole="button" onPress={() => setChoice("no")} style={styles.button}><Text style={styles.buttonText}>No</Text></Pressable></View>{choice === "no" ? <View style={styles.reasons}>{reasons.map(([value, label]) => <Pressable accessibilityRole="button" key={value} onPress={() => void send(false, value)} style={styles.reason}><Text style={styles.reasonText}>{label}</Text></Pressable>)}</View> : null}</View>;
}
const styles = StyleSheet.create({ wrap: { paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }, label: { ...typography.caption, color: colors.textTertiary }, actions: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.xs }, button: { minWidth: 64, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: radii.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, buttonText: { ...typography.label, color: colors.textPrimary }, reasons: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm }, reason: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.sm, borderRadius: radii.sm, backgroundColor: colors.surface }, reasonText: { ...typography.caption, color: colors.textSecondary }, thanks: { ...typography.caption, color: colors.textSecondary, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border } });
