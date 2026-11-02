import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { MotionPressable as Pressable, SelectionTrack, useMeasuredWidth } from "@/components/motion";
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
  const { ref, onLayout, width } = useMeasuredWidth();
  const optionWidth = Math.max(0, width - 10) / 2;
  return (
    <View accessibilityLabel="Brief type" accessibilityRole="radiogroup" onLayout={onLayout} ref={ref} style={styles.wrap}>
      <GlassBackdrop intensity={18} />
      <SelectionTrack frame={width ? { x: 5 + (value === "evening" ? optionWidth : 0), y: 5, width: optionWidth, height: 46 } : null} radius={radii.sm} tone="neutral" />
      {(["morning", "evening"] as const).map((type) => {
        const selected = value === type;
        return (
          <Pressable
            accessibilityLabel={type === "morning" ? "Morning Brief" : "Evening Recap"}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            aria-checked={selected}
            key={type}
            onPress={() => {
              if (value !== type) {
                void Haptics.selectionAsync().catch(() => undefined);
                onChange(type);
              }
            }}
            style={styles.option}
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
  text: { ...typography.label, color: colors.textTertiary },
  selectedText: { color: colors.teal },
});
