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
      <Animated.View style={[styles.hero, animatedStyle]} />
      <View style={styles.row}>
        <Animated.View style={[styles.card, animatedStyle]} />
        <Animated.View style={[styles.card, animatedStyle]} />
      </View>
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
  hero: {
    height: 310,
    marginTop: spacing.sm,
    borderRadius: radii.hero,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    height: 132,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
});

