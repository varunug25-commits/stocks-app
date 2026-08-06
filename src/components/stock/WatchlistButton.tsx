import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export function WatchlistButton({
  added,
  onPress,
  disabled = false,
}: {
  added: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={added ? "Remove from watchlist" : "Add to watchlist"}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: added }}
      disabled={disabled}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[s.button, added && s.added, disabled && s.disabled]}
    >
      <Ionicons
        color={added ? colors.teal : colors.background}
        name={added ? "checkmark" : "add"}
        size={18}
      />
      <Text style={[s.text, added && s.addedText]}>
        {added ? "Watching" : "Watch"}
      </Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  button: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.teal,
  },
  added: {
    backgroundColor: colors.tealMuted,
    borderWidth: 1,
    borderColor: "#28584F",
  },
  disabled: { opacity: 0.45 },
  text: { ...typography.label, color: colors.background },
  addedText: { color: colors.teal },
});
