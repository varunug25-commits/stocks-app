import { StyleSheet, Text, View } from "react-native";
import type { BriefStatus } from "@/data/briefs";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function BriefStatusBadge({ status }: { status: BriefStatus }) {
  const tone =
    status === "Saved"
      ? styles.saved
      : status === "Read"
        ? styles.read
        : styles.fresh;
  return (
    <View accessibilityLabel={`${status} brief`} style={[styles.badge, tone]}>
      <Text style={[styles.text, status === "New" && styles.freshText]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  fresh: { backgroundColor: colors.tealMuted, borderColor: "#2B695D" },
  saved: { backgroundColor: "#2B2417", borderColor: "#5A4923" },
  read: { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
  text: { ...typography.caption, color: colors.textSecondary, fontSize: 10 },
  freshText: { color: colors.teal },
});
