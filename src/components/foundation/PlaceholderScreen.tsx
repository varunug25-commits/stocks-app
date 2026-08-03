import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/foundation/Screen";
import { colors, radii, spacing, typography } from "@/theme/tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

type PlaceholderScreenProps = {
  icon: IconName;
  title: string;
  description: string;
};

export function PlaceholderScreen({ icon, title, description }: PlaceholderScreenProps) {
  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons color={colors.teal} name={icon} size={28} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>COMING IN A LATER PHASE</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.tealMuted,
    borderWidth: 1,
    borderColor: "#23584D",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: "center",
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    maxWidth: 320,
  },
  badge: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.7,
  },
});

