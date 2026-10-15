import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
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
            <Ionicons color={selected ? colors.teal : colors.textTertiary} name={type === "morning" ? "sunny-outline" : "moon-outline"} size={17} />
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
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
  },
  selected: { backgroundColor: colors.surfaceSoft },
  text: { ...typography.label, color: colors.textTertiary },
  selectedText: { color: colors.teal },
});
