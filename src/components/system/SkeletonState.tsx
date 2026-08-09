import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import { colors, radii, spacing } from "@/theme/tokens";

type SkeletonVariant = "today" | "stock" | "brief" | "watchlist" | "pulse";

const labels: Record<SkeletonVariant, string> = {
  today: "Loading Today changes",
  stock: "Loading stock details",
  brief: "Loading brief publication",
  watchlist: "Loading watchlist",
  pulse: "Loading watchlist Pulse",
};

export function SkeletonState({ variant = "today" }: { variant?: SkeletonVariant }) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 0.62 : 0.38);

  useEffect(() => {
    opacity.value = reduceMotion ? 0.62 : withRepeat(withTiming(0.78, { duration: 900 }), -1, true);
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const rowCount = variant === "brief" ? 4 : 3;

  return (
    <View accessibilityLabel={labels[variant]} accessibilityLiveRegion="polite" accessibilityRole="progressbar" style={styles.container}>
      <Animated.View style={[styles.lineSmall, animatedStyle]} />
      <Animated.View style={[styles.lineLarge, animatedStyle]} />
      {variant === "stock" ? <>
        <Animated.View style={[styles.price, animatedStyle]} />
        <Animated.View style={[styles.chart, animatedStyle]} />
      </> : null}
      {variant === "today" ? <Animated.View style={[styles.snapshot, animatedStyle]} /> : null}
      {variant === "brief" ? <Animated.View style={[styles.artwork, animatedStyle]} /> : null}
      {variant === "pulse" ? <Animated.View style={[styles.breadth, animatedStyle]} /> : null}
      {Array.from({ length: rowCount }, (_, index) => <Animated.View key={index} style={[styles.listRow, animatedStyle]} />)}
      {variant === "today" ? <Animated.View style={[styles.nextUp, animatedStyle]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.sm },
  lineSmall: { width: 108, height: 12, borderRadius: radii.pill, backgroundColor: colors.surfaceSoft },
  lineLarge: { width: 210, height: 30, borderRadius: radii.sm, backgroundColor: colors.surfaceSoft },
  snapshot: { height: 96, marginTop: spacing.sm, borderRadius: radii.md, backgroundColor: colors.surface },
  price: { width: 156, height: 42, marginTop: spacing.sm, borderRadius: radii.sm, backgroundColor: colors.surfaceSoft },
  chart: { height: 188, borderRadius: radii.md, backgroundColor: colors.surface },
  artwork: { height: 124, marginTop: spacing.sm, borderRadius: radii.md, backgroundColor: colors.surface },
  breadth: { height: 76, marginTop: spacing.sm, borderRadius: radii.md, backgroundColor: colors.surface },
  listRow: { height: 64, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, backgroundColor: colors.surface },
  nextUp: { height: 72, marginTop: spacing.sm, borderRadius: radii.sm, backgroundColor: colors.surface },
});
