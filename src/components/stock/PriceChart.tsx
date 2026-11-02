import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { ChartPoint } from "@/data/stocks";
import { colors, motion, numerals, spacing, typography } from "@/theme/tokens";
const H = 190;
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export function PriceChart({
  points,
  positive,
  summary,
  unavailable = false,
  timeLabel = "PRICE HISTORY",
}: {
  points: ChartPoint[];
  positive: boolean;
  summary: string;
  unavailable?: boolean;
  timeLabel?: string;
}) {
  const [width, setWidth] = useState(340);
  const chartRef = useRef<View>(null);
  const [selection, setSelected] = useState<number | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const reduceMotion = useReducedMotion();
  const reveal = useSharedValue(reduceMotion ? 1 : 0);
  // Compare values, not array identity: parent renders must not replay a chart.
  const datasetKey = JSON.stringify(points.map(({ label, value }) => [label, value]));
  useEffect(() => {
    cancelAnimation(reveal);
    if (reduceMotion || points.length === 1) {
      reveal.set(1);
    } else {
      reveal.set(0);
      if (!unavailable && points.length > 1) {
        reveal.set(withTiming(1, { duration: motion.reveal, easing: Easing.out(Easing.cubic) }));
      }
    }
    return () => cancelAnimation(reveal);
  }, [datasetKey, points.length, reduceMotion, reveal, unavailable]);
  useEffect(() => {
    if (Platform.OS !== "web" || unavailable) return;
    const element = chartRef.current as unknown as HTMLElement | null;
    if (!element?.getBoundingClientRect) return;
    // Keep web geometry responsive even when RN Web's onLayout is delayed.
    const measure = () => {
      const next = element.getBoundingClientRect().width;
      if (next > 0) setWidth(next);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [unavailable]);
  const coordinates = useMemo(() => {
    const values = points.map((p) => p.value),
      min = Math.min(...values),
      max = Math.max(...values),
      range = Math.max(max - min, 1);
    return points
      .map((p, i) => ({
        x: 8 + (i / Math.max(points.length - 1, 1)) * Math.max(width - 16, 1),
        y: H - 18 - ((p.value - min) / range) * (H - 42),
      }));
  }, [points, width]);
  const path = coordinates
    .map(({ x, y }, i) => `${i ? "L" : "M"} ${x} ${y}`)
    .join(" ");
  const pathLength = Math.max(1, coordinates.reduce((length, point, index) => {
    const previous = coordinates[index - 1];
    return previous ? length + Math.hypot(point.x - previous.x, point.y - previous.y) : length;
  }, 0));
  const pathAnimation = useAnimatedProps(() => ({
    strokeDashoffset: pathLength * (1 - reveal.value),
  }));
  const endpointAnimation = useAnimatedProps(() => ({
    opacity: Math.max(0, Math.min(1, (reveal.value - 0.88) / 0.12)),
  }));
  const update = (x: number) =>
    setSelected(
      Math.max(
        0,
        Math.min(
          points.length - 1,
          Math.round(((x - 8) / Math.max(width - 16, 1)) * (points.length - 1)),
        ),
      ),
    );
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      cancelAnimation(reveal);
      reveal.set(1);
      setScrubbing(true);
      update(e.nativeEvent.locationX);
    },
    onPanResponderMove: (e) => update(e.nativeEvent.locationX),
    onPanResponderRelease: () => setScrubbing(false),
    onPanResponderTerminate: () => setScrubbing(false),
  });
  if (unavailable || !points.length)
    return (
      <View style={s.unavailable}>
        <Text style={s.unavailableTitle}>Chart unavailable</Text>
        <Text style={s.summary}>Price history is currently unavailable.</Text>
      </View>
    );
  const selected = selection ?? points.length - 1;
  const safeSelected = Math.max(0, Math.min(selected, points.length - 1));
  const point = points[safeSelected]!;
  const coordinate = coordinates[safeSelected] ?? { x: width, y: H / 2 };
  return (
    <View
      accessibilityLabel={summary}
      accessible
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      ref={chartRef}
      style={s.wrap}
      {...pan.panHandlers}
    >
      <View style={s.tooltip}>
        <Text style={s.tooltipLabel}>{scrubbing ? point.label : timeLabel}</Text>
        <Text style={s.tooltipValue}>{scrubbing ? `$${point.value.toFixed(2)}` : "Touch chart to explore"}</Text>
      </View>
      <Svg height={H} viewBox={`0 0 ${width} ${H}`} width="100%">
        {[0.25, 0.6, 0.95].map((fraction) => <Line key={fraction} stroke={colors.borderSoft} strokeDasharray="3 5" x1={0} x2={width} y1={H * fraction} y2={H * fraction} />)}
        <AnimatedPath
          animatedProps={pathAnimation}
          d={path}
          fill="none"
          stroke={positive ? colors.positive : colors.negative}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={[pathLength, pathLength]}
          strokeWidth={3}
        />
        {scrubbing ? <Line
          stroke={colors.border}
          strokeDasharray="4 5"
          x1={coordinate.x}
          x2={coordinate.x}
          y1={24}
          y2={H - 10}
        /> : null}
        <AnimatedCircle
          animatedProps={endpointAnimation}
          cx={coordinate.x}
          cy={coordinate.y}
          fill={colors.background}
          r={6}
          stroke={positive ? colors.positive : colors.negative}
          strokeWidth={3}
        />
      </Svg>
      <View style={s.axis}><Text style={s.tooltipLabel}>{points[0]?.label}</Text><Text style={s.tooltipLabel}>{points[points.length - 1]?.label}</Text></View>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { paddingTop: spacing.sm },
  tooltip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 30,
  },
  tooltipValue: { ...numerals, ...typography.caption, color: colors.textSecondary },
  tooltipLabel: { ...typography.caption, color: colors.textTertiary },
  axis: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
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
    backgroundColor: colors.surface,
  },
  unavailableTitle: { ...typography.heading, color: colors.textPrimary },
});
