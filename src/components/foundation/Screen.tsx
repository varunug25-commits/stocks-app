/* eslint-disable react-hooks/immutability -- Reanimated shared values are intentionally mutable. */
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import type { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, motion } from "@/theme/tokens";

export function Screen({ children }: PropsWithChildren) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(1);
  useFocusEffect(useCallback(() => {
    progress.value = reduced ? 1 : 0;
    if (!reduced) progress.value = withTiming(1, { duration: motion.standard });
    return () => cancelAnimation(progress);
  }, [progress, reduced]));
  const entrance = useAnimatedStyle(() => ({ opacity: reduced ? 1 : 0.7 + progress.value * 0.3, transform: [{ translateY: reduced ? 0 : (1 - progress.value) * 8 }] }));
  return (
    <Animated.View style={[styles.root, entrance]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {children}
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
