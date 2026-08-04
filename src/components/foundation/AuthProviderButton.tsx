import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function AuthProviderButton({ provider, onPress }: { provider: "Apple" | "Google"; onPress: () => void }) {
  return <Pressable accessibilityLabel={`Continue with ${provider}, demo only`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Ionicons color={colors.textPrimary} name={provider === "Apple" ? "logo-apple" : "logo-google"} size={20} /><Text style={styles.label}>Continue with {provider}</Text></Pressable>;
}
const styles = StyleSheet.create({ button: { minHeight: 52, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, pressed: { opacity: .75 }, label: { ...typography.label, color: colors.textPrimary } });
