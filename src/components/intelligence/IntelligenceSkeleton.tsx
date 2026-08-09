import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { colors, radii, spacing } from "@/theme/tokens";

export function IntelligenceSkeleton() {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 0.62 : 0.35);
  useEffect(() => {
    opacity.value = reduceMotion ? 0.62 : withRepeat(withTiming(0.75, { duration: 850 }), -1, true);
  }, [opacity, reduceMotion]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <View accessibilityLabel="Loading grounded intelligence" accessibilityLiveRegion="polite" accessibilityRole="progressbar" style={styles.wrap}>
      <Animated.View style={[styles.heading, animated]} />
      <Animated.View style={[styles.line, animated]} />
      <Animated.View style={[styles.lineShort, animated]} />
      <Animated.View style={[styles.line, animated]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, paddingVertical: spacing.md },
  heading: { width: 138, height: 18, borderRadius: radii.sm, backgroundColor: colors.surfaceSoft },
  line: { width: "100%", height: 13, borderRadius: radii.sm, backgroundColor: colors.surfaceSoft },
  lineShort: { width: "72%", height: 13, borderRadius: radii.sm, backgroundColor: colors.surfaceSoft },
});
