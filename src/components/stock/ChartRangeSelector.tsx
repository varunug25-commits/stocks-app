import * as Haptics from "expo-haptics";
import { StyleSheet, Text, View } from "react-native";
import { MotionPressable, SelectionTrack, useMeasuredWidth } from "@/components/motion";
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
  const { ref, onLayout, width } = useMeasuredWidth();
  const itemWidth = Math.max(0, width - 6) / chartRanges.length;
  return (
    <View accessibilityLabel="Chart range" accessibilityRole="radiogroup" onLayout={onLayout} ref={ref} style={s.row}>
      <SelectionTrack frame={width ? { x: 3 + chartRanges.indexOf(value) * itemWidth, y: 3, width: itemWidth, height: 44 } : null} radius={radii.sm} tone="teal" />
      {chartRanges.map((range) => (
        <MotionPressable
          accessibilityLabel={range}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === range }}
          aria-checked={value === range}
          key={range}
          onPress={() => {
            if (range !== value) {
              void Haptics.selectionAsync();
              onChange(range);
            }
          }}
          scaleTo={0.98}
          style={s.item}
        >
          <Text style={[s.text, value === range && s.selectedText]}>
            {range}
          </Text>
        </MotionPressable>
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
  text: { ...typography.label, color: colors.textTertiary },
  selectedText: { color: colors.teal },
});
