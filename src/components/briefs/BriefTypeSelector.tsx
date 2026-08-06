import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BriefType } from "@/data/briefs";
import { colors, radii, typography } from "@/theme/tokens";

export function BriefTypeSelector({
  value,
  onChange,
}: {
  value: BriefType;
  onChange: (value: BriefType) => void;
}) {
  return (
    <View accessibilityLabel="Brief type" accessibilityRole="radiogroup" style={styles.wrap}>
      {(["morning", "evening"] as const).map((type) => {
        const selected = value === type;
        return (
          <Pressable
            accessibilityLabel={type === "morning" ? "Morning Brief" : "Evening Recap"}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            key={type}
            onPress={() => {
              void Haptics.selectionAsync();
              onChange(type);
            }}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.text, selected && styles.selectedText]}>
              {type === "morning" ? "Morning" : "Evening"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    padding: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
  },
  selected: { backgroundColor: colors.tealMuted },
  text: { ...typography.label, color: colors.textTertiary },
  selectedText: { color: colors.teal },
});
