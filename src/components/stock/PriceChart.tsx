import { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import type { ChartPoint } from "@/data/stocks";
import { colors, radii, spacing, typography } from "@/theme/tokens";
const H = 190;
export function PriceChart({
  points,
  positive,
  summary,
  unavailable = false,
}: {
  points: ChartPoint[];
  positive: boolean;
  summary: string;
  unavailable?: boolean;
}) {
  const [width, setWidth] = useState(340);
  const [selected, setSelected] = useState(points.length - 1);
  const coordinates = useMemo(() => {
    const values = points.map((p) => p.value),
      min = Math.min(...values),
      max = Math.max(...values),
      range = Math.max(max - min, 1);
    return points
      .map((p, i) => ({
        x: (i / Math.max(points.length - 1, 1)) * width,
        y: H - 18 - ((p.value - min) / range) * (H - 42),
      }));
  }, [points, width]);
  const path = coordinates
    .map(({ x, y }, i) => `${i ? "L" : "M"} ${x} ${y}`)
    .join(" ");
  const update = (x: number) =>
    setSelected(
      Math.max(
        0,
        Math.min(
          points.length - 1,
          Math.round((x / width) * (points.length - 1)),
        ),
      ),
    );
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => update(e.nativeEvent.locationX),
    onPanResponderMove: (e) => update(e.nativeEvent.locationX),
  });
  if (unavailable)
    return (
      <View style={s.unavailable}>
        <Text style={s.unavailableTitle}>Chart unavailable</Text>
        <Text style={s.summary}>The local series could not be prepared.</Text>
      </View>
    );
  const safeSelected = Math.max(0, Math.min(selected, points.length - 1));
  const point = points[safeSelected]!;
  const coordinate = coordinates[safeSelected] ?? { x: width, y: H / 2 };
  return (
    <View
      accessibilityLabel={summary}
      accessible
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={s.wrap}
      {...pan.panHandlers}
    >
      <View style={s.tooltip}>
        <Text style={s.tooltipValue}>${point.value.toFixed(2)}</Text>
        <Text style={s.tooltipLabel}>{point.label}</Text>
      </View>
      <Svg height={H} width="100%">
        <Path
          d={path}
          fill="none"
          stroke={positive ? colors.positive : colors.negative}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
        />
        <Line
          stroke={colors.border}
          strokeDasharray="4 5"
          x1={coordinate.x}
          x2={coordinate.x}
          y1={24}
          y2={H - 10}
        />
        <Circle
          cx={coordinate.x}
          cy={coordinate.y}
          fill={colors.background}
          r={6}
          stroke={positive ? colors.positive : colors.negative}
          strokeWidth={3}
        />
      </Svg>
      <Text style={s.summary}>{summary}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { paddingTop: spacing.sm },
  tooltip: {
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
  },
  tooltipValue: { ...typography.label, color: colors.textPrimary },
  tooltipLabel: { ...typography.caption, color: colors.textTertiary },
  summary: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  unavailable: {
    minHeight: H,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  unavailableTitle: { ...typography.heading, color: colors.textPrimary },
});
