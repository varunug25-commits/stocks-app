import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { ComponentProps, PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";

type SelectProps = PropsWithChildren<{ label: string; description?: string; selected: boolean; onPress: () => void; icon?: ComponentProps<typeof Ionicons>["name"] }>;
export function SelectionCard({ label, description, selected, onPress, icon = "analytics-outline" }: SelectProps) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => { void Haptics.selectionAsync(); onPress(); }} style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.pressed]}><View style={[styles.icon, selected && styles.iconSelected]}><Ionicons color={selected ? colors.background : colors.textSecondary} name={icon} size={20} /></View><View style={styles.copy}><Text style={styles.label}>{label}</Text>{description ? <Text style={styles.description}>{description}</Text> : null}</View><Ionicons color={selected ? colors.teal : colors.textTertiary} name={selected ? "checkmark-circle" : "ellipse-outline"} size={22} /></Pressable>;
}
export function MultiSelectChip({ label, selected, onPress }: Omit<SelectProps, "description" | "icon">) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => { void Haptics.selectionAsync(); onPress(); }} style={[styles.chip, selected && styles.chipSelected]}><Ionicons color={selected ? colors.background : colors.textSecondary} name={selected ? "checkmark" : "add"} size={17} /><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;
}
export function ProgressIndicator({ step, total = 7 }: { step: number; total?: number }) {
  return <View accessibilityLabel={`Step ${step} of ${total}`} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: step }} style={styles.progressWrap}><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${(step / total) * 100}%` }]} /></View><Text style={styles.progressText}>{step} OF {total}</Text></View>;
}
const styles = StyleSheet.create({
  card: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, cardSelected: { borderColor: colors.teal, backgroundColor: colors.tealMuted }, pressed: { opacity: .8 }, icon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceSoft }, iconSelected: { backgroundColor: colors.teal }, copy: { flex: 1 }, label: { ...typography.label, fontSize: 16, color: colors.textPrimary }, description: { ...typography.caption, color: colors.textSecondary, marginTop: 3 }, chip: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md }, chipSelected: { backgroundColor: colors.teal, borderColor: colors.teal }, chipText: { ...typography.label, color: colors.textSecondary }, chipTextSelected: { color: colors.background }, progressWrap: { flexDirection: "row", alignItems: "center", gap: spacing.sm }, progressTrack: { flex: 1, height: 4, overflow: "hidden", borderRadius: radii.pill, backgroundColor: colors.surfaceSoft }, progressFill: { height: 4, borderRadius: radii.pill, backgroundColor: colors.teal }, progressText: { ...typography.caption, color: colors.textTertiary, letterSpacing: .8 },
});
