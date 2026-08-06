import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import type { TextInputProps } from "react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";

type Props = TextInputProps & { label: string; error?: string };
export function FormField({ label, error, style, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  return <View style={styles.group}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} onBlur={(e) => { setFocused(false); props.onBlur?.(e); }} onFocus={(e) => { setFocused(true); props.onFocus?.(e); }} placeholderTextColor={colors.textTertiary} style={[styles.input, focused && styles.focused, error && styles.invalid, style]} {...props} />{error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}</View>;
}
export function PasswordField(props: Props) {
  const [visible, setVisible] = useState(false);
  return <View><FormField {...props} secureTextEntry={!visible} /><Pressable accessibilityLabel={visible ? "Hide password" : "Show password"} accessibilityRole="button" onPress={() => setVisible(!visible)} style={styles.eye}><Ionicons color={colors.textSecondary} name={visible ? "eye-off-outline" : "eye-outline"} size={21} /></Pressable></View>;
}
const styles = StyleSheet.create({
  group: { gap: spacing.xs }, label: { ...typography.label, color: colors.textSecondary }, input: { minHeight: 54, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, color: colors.textPrimary, fontSize: 16 }, focused: { borderColor: colors.focus }, invalid: { borderColor: colors.negative }, error: { ...typography.caption, color: colors.negative }, eye: { position: "absolute", right: 5, top: 31, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
});
