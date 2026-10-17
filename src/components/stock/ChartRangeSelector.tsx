import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ChartRange } from "@/data/stocks";
import { chartRanges } from "@/data/stocks";
import { colors, radii, typography } from "@/theme/tokens";
export function ChartRangeSelector({
  value,
  onChange,
}: {
  value: ChartRange;
  onChange: (range: ChartRange) => void;
}) {
  return (
    <View accessibilityLabel="Chart range" accessibilityRole="radiogroup" style={s.row}>
      {chartRanges.map((range) => (
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: value === range }}
          aria-checked={value === range}
          key={range}
          onPress={() => {
            void Haptics.selectionAsync();
            onChange(range);
          }}
          style={[s.item, value === range && s.selected]}
        >
          <Text style={[s.text, value === range && s.selectedText]}>
            {range}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", padding: 3, borderRadius: 12, backgroundColor: colors.surfaceElevated },
  item: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
  },
  selected: { backgroundColor: colors.tealMuted },
  text: { ...typography.label, color: colors.textTertiary },
  selectedText: { color: colors.teal },
});
