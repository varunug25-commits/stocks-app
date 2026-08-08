import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import { colors, radii, spacing } from "@/theme/tokens";

export function SkeletonState() {
  const opacity = useSharedValue(0.38);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.78, { duration: 900 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View accessibilityLabel="Loading market briefing" accessibilityRole="progressbar" style={styles.container}>
      <Animated.View style={[styles.lineSmall, animatedStyle]} />
      <Animated.View style={[styles.lineLarge, animatedStyle]} />
      <Animated.View style={[styles.panel, animatedStyle]} />
      <Animated.View style={[styles.listRow, animatedStyle]} />
      <Animated.View style={[styles.listRow, animatedStyle]} />
      <Animated.View style={[styles.listRow, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  lineSmall: {
    width: 108,
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSoft,
  },
  lineLarge: {
    width: 210,
    height: 30,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSoft,
  },
  panel: {
    height: 126,
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  listRow: { height: 64, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, backgroundColor: colors.surface },
});
