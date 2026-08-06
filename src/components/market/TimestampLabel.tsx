import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme/tokens";
export function TimestampLabel({ label }: { label: string }) { return <View accessibilityLabel={label} style={styles.row}><Ionicons color={colors.textTertiary} name="time-outline" size={14} /><Text style={styles.text}>{label}</Text></View>; }
const styles = StyleSheet.create({ row: { minHeight: 24, flexDirection: "row", alignItems: "center", gap: spacing.xxs }, text: { ...typography.caption, color: colors.textTertiary } });
