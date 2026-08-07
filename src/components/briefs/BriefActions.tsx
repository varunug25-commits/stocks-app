import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function SaveBriefButton({ saved, onPress }: { saved: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={saved ? "Remove brief from saved" : "Save brief"} accessibilityRole="button" accessibilityState={{ selected: saved }} onPress={onPress} style={[styles.button, saved && styles.selected]}>
      <Ionicons color={saved ? colors.warning : colors.teal} name={saved ? "bookmark" : "bookmark-outline"} size={20} />
      <Text style={styles.text}>{saved ? "Saved" : "Save"}</Text>
    </Pressable>
  );
}

export function ShareBriefButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityLabel="Share demo brief" accessibilityRole="button" onPress={onPress} style={styles.button}>
      <Ionicons color={colors.teal} name="share-outline" size={20} />
      <Text style={styles.text}>Share</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 48, flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  selected: { backgroundColor: "#2B2417", borderColor: "#5A4923" },
  text: { ...typography.label, color: colors.textPrimary },
});
