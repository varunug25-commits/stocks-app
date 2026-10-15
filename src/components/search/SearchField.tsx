import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";

import { colors, radii, spacing, typography } from "@/theme/tokens";

export function SearchField({ value, onChangeText, autoFocus = false }: { value: string; onChangeText: (value: string) => void; autoFocus?: boolean }) {
  const [focused, setFocused] = useState(false);
  return <View style={[styles.wrap, focused && styles.focused]}><Ionicons color={focused ? colors.teal : colors.textSecondary} name="search" size={20} /><TextInput accessibilityLabel="Search stocks" autoCapitalize="characters" autoCorrect={false} autoFocus={autoFocus} onBlur={() => setFocused(false)} onChangeText={onChangeText} onFocus={() => setFocused(true)} placeholder="Search symbol or company" placeholderTextColor={colors.textTertiary} returnKeyType="search" style={[styles.input, Platform.OS === "web" && { outlineWidth: 0 }]} value={value} />{value ? <Pressable accessibilityLabel="Clear search" accessibilityRole="button" onPress={() => onChangeText("")} style={styles.clear}><Ionicons color={colors.textSecondary} name="close-circle" size={20} /></Pressable> : null}</View>;
}

const styles = StyleSheet.create({
  wrap: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  focused: { borderColor: colors.focus },
  input: { ...typography.body, flex: 1, color: colors.textPrimary, paddingVertical: spacing.sm },
  clear: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: -spacing.sm },
});
