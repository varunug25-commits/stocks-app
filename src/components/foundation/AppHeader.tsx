import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme/tokens";
import { LogoMark } from "./LogoMark";

export function AppHeader({ title, back = false, actionLabel, onAction }: { title?: string; back?: boolean; actionLabel?: string; onAction?: () => void }) {
  const router = useRouter();
  return <View style={styles.row}>{back ? <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.icon}><Ionicons color={colors.textPrimary} name="arrow-back" size={22} /></Pressable> : <LogoMark compact />}<Text numberOfLines={1} style={styles.title}>{title}</Text>{actionLabel ? <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}><Text style={styles.actionText}>{actionLabel}</Text></Pressable> : <View style={styles.spacer} />}</View>;
}
const styles = StyleSheet.create({
  row: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: spacing.sm }, title: { ...typography.label, flex: 1, color: colors.textPrimary, textAlign: "center" },
  icon: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }, spacer: { width: 44 }, action: { minWidth: 44, minHeight: 44, alignItems: "flex-end", justifyContent: "center" }, actionText: { ...typography.label, color: colors.teal },
});
