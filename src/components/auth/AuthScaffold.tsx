import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AppHeader } from "@/components/foundation/AppHeader";
import { AppScreen } from "@/components/foundation/AppScreen";
import { DemoDataBadge } from "@/components/foundation/Feedback";
import { colors, spacing, typography } from "@/theme/tokens";

export function AuthScaffold({ title, description, children, footer, back = true }: PropsWithChildren<{ title: string; description: string; footer?: ReactNode; back?: boolean }>) {
  return <AppScreen keyboard padded scroll><AppHeader back={back} /><Animated.View entering={FadeInDown.duration(380)} style={styles.body}><DemoDataBadge /><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text><View style={styles.form}>{children}</View>{footer}</Animated.View></AppScreen>;
}
const styles = StyleSheet.create({ body: { flex: 1, width: "100%", maxWidth: 520, alignSelf: "center", paddingTop: spacing.lg }, title: { ...typography.display, color: colors.textPrimary, letterSpacing: -1, marginTop: spacing.lg }, description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs }, form: { gap: spacing.md, marginTop: spacing.xxl } });
