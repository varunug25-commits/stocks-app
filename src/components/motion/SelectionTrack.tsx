import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, motion } from "@/theme/tokens";

type Frame = { x: number; y: number; width: number; height: number };

export function SelectionTrack({ frame, radius = 12, tone = "teal" }: { frame: Frame | null; radius?: number; tone?: "teal" | "neutral" }) {
  const reduced = useReducedMotion();
  const initialized = useRef(false);
  const x = useSharedValue(frame?.x ?? 0);
  const y = useSharedValue(frame?.y ?? 0);
  const width = useSharedValue(frame?.width ?? 0);
  const height = useSharedValue(frame?.height ?? 0);
  const nextX = frame?.x, nextY = frame?.y, nextWidth = frame?.width, nextHeight = frame?.height;
  useEffect(() => {
    if (nextX === undefined || nextY === undefined || nextWidth === undefined || nextHeight === undefined) return;
    const immediate = reduced || !initialized.current;
    const update = (value: number) => immediate ? value : withTiming(value, { duration: motion.selection });
    x.value = update(nextX);
    y.value = update(nextY);
    width.value = update(nextWidth);
    height.value = update(nextHeight);
    initialized.current = true;
  }, [height, nextHeight, nextWidth, nextX, nextY, reduced, width, x, y]);
  useEffect(() => () => {
    cancelAnimation(x); cancelAnimation(y); cancelAnimation(width); cancelAnimation(height);
  }, [height, width, x, y]);
  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value, height: height.value,
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));
  if (!frame) return null;
  return <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[styles.track, { borderRadius: radius, backgroundColor: tone === "teal" ? colors.tealMuted : colors.surfaceSoft }, animatedStyle]} />;
}

const styles = StyleSheet.create({
  track: { position: "absolute", left: 0, top: 0, borderWidth: 1, borderColor: "#FFFFFF12" },
});
