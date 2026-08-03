import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/theme/tokens";

type SubscriptionPaywallProps = {
  onDismiss: () => void;
  onContinue: () => void;
};

export function SubscriptionPaywall({ onDismiss, onContinue }: SubscriptionPaywallProps) {
  return (
    <LinearGradient colors={["#173A33", "#0E1718", "#101416"]} style={styles.card}>
      <Pressable accessibilityLabel="Dismiss subscription offer" onPress={onDismiss} style={styles.close}>
        <Ionicons color={colors.textSecondary} name="close" size={21} />
      </Pressable>
      <View style={styles.icon}><Ionicons color={colors.teal} name="sparkles" size={23} /></View>
      <Text style={styles.eyebrow}>SIGNAL PLUS · PREVIEW</Text>
      <Text style={styles.title}>More context, less market noise.</Text>
      <Text style={styles.body}>This reusable surface is ready for a future subscription phase. Purchasing is intentionally disabled.</Text>
      <Pressable accessibilityRole="button" onPress={onContinue} style={styles.button}>
        <Text style={styles.buttonText}>Continue preview</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    borderRadius: radii.hero,
    borderWidth: 1,
    borderColor: "#2C5B51",
  },
  close: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.tealMuted,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.teal,
    letterSpacing: 1,
    marginTop: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  button: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    borderRadius: radii.md,
    backgroundColor: colors.teal,
  },
  buttonText: {
    ...typography.label,
    color: colors.background,
  },
});

