import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export function InterpretationCard({
  kind,
  text,
}: {
  kind: "FACT" | "INTERPRETATION" | "UNCERTAINTY";
  text: string;
}) {
  const warning = kind === "UNCERTAINTY";
  return (
    <View style={[s.card, warning && s.warning]}>
      <Text style={[s.kind, warning && s.warningText]}>{kind}</Text>
      <Text style={s.text}>{text}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.teal,
  },
  warning: { borderLeftColor: colors.warning },
  kind: { ...typography.caption, color: colors.teal, letterSpacing: 1 },
  warningText: { color: colors.warning },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
