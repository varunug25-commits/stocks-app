import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme/tokens";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ eyebrow, title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 1.05,
    marginBottom: 2,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  action: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionText: {
    ...typography.label,
    color: colors.teal,
  },
});
