import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { AppHeader } from "@/components/foundation/AppHeader";
import { AppScreen } from "@/components/foundation/AppScreen";
import { ProgressIndicator } from "@/components/foundation/Selections";
import { colors, spacing, typography } from "@/theme/tokens";

export function OnboardingScaffold({ step, title, description, children, footer, back = step > 1, skipLabel, onSkip }: PropsWithChildren<{ step: number; title: string; description: string; footer: ReactNode; back?: boolean; skipLabel?: string; onSkip?: () => void }>) {
  return <AppScreen padded scroll><AppHeader actionLabel={skipLabel} back={back} onAction={onSkip} /><View style={styles.progress}><ProgressIndicator step={step} /></View><Animated.View entering={FadeInRight.duration(330)} style={styles.body}><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text><View style={styles.content}>{children}</View><View style={styles.footer}>{footer}</View></Animated.View></AppScreen>;
}
const styles = StyleSheet.create({ progress: { marginTop: spacing.xs }, body: { flex: 1, width: "100%", maxWidth: 560, alignSelf: "center", paddingTop: spacing.xl }, title: { ...typography.display, color: colors.textPrimary, letterSpacing: -1 }, description: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs }, content: { flex: 1, gap: spacing.sm, marginTop: spacing.xxl }, footer: { gap: spacing.sm, marginTop: spacing.xxl } });
