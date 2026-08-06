import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MovementInsight } from "@/data/stocks";
import { ConfidenceIndicator } from "./ConfidenceIndicator";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export function WhyItMovedCard({
  insight,
  onPress,
}: {
  insight: MovementInsight;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel="Open expanded Why It Moved explanation"
      accessibilityRole="button"
      onPress={onPress}
      style={s.card}
    >
      <View style={s.top}>
        <View>
          <Text style={s.eyebrow}>WHY IT MOVED</Text>
          <Text style={s.title}>
            {insight.sufficientEvidence
              ? "The clearest explanation"
              : "Evidence remains limited"}
          </Text>
        </View>
        <Ionicons color={colors.teal} name="arrow-forward" size={20} />
      </View>
      <Text style={s.summary}>{insight.summary}</Text>
      <View style={s.footer}>
        <ConfidenceIndicator level={insight.confidence} />
        <Text style={s.link}>See evidence</Text>
      </View>
    </Pressable>
  );
}
const s = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radii.hero,
    backgroundColor: colors.tealMuted,
    borderWidth: 1,
    borderColor: "#28584F",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  eyebrow: { ...typography.caption, color: colors.teal, letterSpacing: 1 },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginTop: spacing.xxs,
  },
  summary: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  link: { ...typography.label, color: colors.teal },
});
