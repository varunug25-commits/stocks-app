import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/theme/tokens";
import type { GeneratedBrief } from "@/data/briefs";

type AIBriefingCardProps = {
  brief: GeneratedBrief;
  onPress: () => void;
};

export function AIBriefingCard({ brief, onPress }: AIBriefingCardProps) {
  return (
    <LinearGradient colors={["#10211F", "#0D1718", "#101719"]} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.orb}>
          <Ionicons color={colors.teal} name="sparkles" size={18} />
        </View>
        <View style={styles.headerCopy}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>SIGNAL BRIEFING</Text>
            <View style={styles.mockBadge}><Text style={styles.mockText}>MOCK</Text></View>
          </View>
          <Text style={styles.updated}>Prepared from local demo content</Text>
        </View>
      </View>
      <Text style={styles.title}>{brief.headline}</Text>
      <Text numberOfLines={3} style={styles.summary}>{brief.summary}</Text>
      <Pressable
        accessibilityHint="Opens the complete local Morning Brief"
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Read Morning Brief</Text>
        <Ionicons color={colors.background} name="arrow-forward" size={17} />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radii.hero,
    borderWidth: 1,
    borderColor: "#285049",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  orb: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.tealMuted,
    borderWidth: 1,
    borderColor: "#2B695D",
  },
  headerCopy: {
    flex: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.teal,
    letterSpacing: 0.9,
  },
  mockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: "#FFFFFF10",
  },
  mockText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.7,
  },
  updated: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  summary: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  button: {
    minHeight: 48,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radii.md,
    backgroundColor: colors.teal,
  },
  buttonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.88,
  },
  buttonText: {
    ...typography.label,
    color: colors.background,
  },
});
