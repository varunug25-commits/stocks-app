import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme/tokens";
import { LogoMark } from "./LogoMark";

export function ProductHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <View style={styles.titleRow}>{title === "MarketBrief" ? <LogoMark compact /> : null}<Text style={[styles.title, title === "MarketBrief" && styles.brandTitle]}>{title}</Text></View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  copy: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  brandTitle: { fontSize: 23, lineHeight: 32, letterSpacing: -0.7 },
  eyebrow: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    letterSpacing: -1,
    marginTop: 3,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 5,
  },
  actions: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
});
