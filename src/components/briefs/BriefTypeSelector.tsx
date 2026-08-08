import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GlassBackdrop } from "@/components/foundation/GlassBackdrop";
import type { BriefType } from "@/data/briefs";
import { colors, glass, radii, typography } from "@/theme/tokens";

export function BriefTypeSelector({
  value,
  onChange,
}: {
  value: BriefType;
  onChange: (value: BriefType) => void;
}) {
  return (
    <View accessibilityLabel="Brief type" accessibilityRole="radiogroup" style={styles.wrap}>
      <GlassBackdrop intensity={18} />
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
    borderRadius: radii.md,
    backgroundColor: glass.fallback,
    borderWidth: 1,
    borderColor: glass.border,
    overflow: "hidden",
  },
  option: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
  },
  selected: { backgroundColor: colors.tealMuted },
  text: { ...typography.label, color: colors.textTertiary },
  selectedText: { color: colors.teal },
});
