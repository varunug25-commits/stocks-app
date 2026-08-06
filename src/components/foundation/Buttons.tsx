import * as Haptics from "expo-haptics";
import type { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";

type Props = PropsWithChildren<{ label: string; onPress: () => void; disabled?: boolean; loading?: boolean; accessibilityLabel?: string }>;
function Base({ label, onPress, disabled, loading, kind, accessibilityLabel }: Props & { kind: "primary" | "secondary" }) {
  return <Pressable accessibilityLabel={accessibilityLabel ?? label} accessibilityRole="button" accessibilityState={{ disabled, busy: loading }} disabled={disabled || loading} onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }} style={({ pressed }) => [styles.base, kind === "primary" ? styles.primary : styles.secondary, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>{loading ? <ActivityIndicator color={kind === "primary" ? colors.background : colors.teal} /> : <Text style={[styles.label, kind === "primary" ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>}</Pressable>;
}
export function PrimaryButton(props: Props) { return <Base {...props} kind="primary" />; }
export function SecondaryButton(props: Props) { return <Base {...props} kind="secondary" />; }
export function TextButton({ label, onPress, disabled }: Omit<Props, "children">) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={styles.textButton}><Text style={[styles.textLabel, disabled && styles.disabledText]}>{label}</Text></Pressable>; }
const styles = StyleSheet.create({
  base: { minHeight: 54, borderRadius: radii.md, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg }, primary: { backgroundColor: colors.teal }, secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled }, pressed: { opacity: .82, transform: [{ scale: .99 }] }, label: { ...typography.label, fontSize: 16 }, primaryLabel: { color: colors.background }, secondaryLabel: { color: colors.textPrimary }, textButton: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.sm }, textLabel: { ...typography.label, color: colors.teal }, disabledText: { color: colors.disabledText },
});
