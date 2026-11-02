import { forwardRef, useEffect, useState } from "react";
import { Pressable } from "react-native";
import type { PressableProps, View } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { motion } from "@/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MotionPressable = forwardRef<View, PressableProps & { scaleTo?: number }>(function MotionPressable(
  { style, children, onPressIn, onPressOut, onHoverIn, onHoverOut, scaleTo = 0.98, disabled, ...props }, ref,
) {
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scale = useSharedValue(1);
  useEffect(() => () => cancelAnimation(scale), [scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduced || disabled ? 1 : scale.value }],
  }));
  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onHoverIn={(event) => { setHovered(true); onHoverIn?.(event); }}
      onHoverOut={(event) => { setHovered(false); onHoverOut?.(event); }}
      onPressIn={(event) => {
        setPressed(true);
        if (!reduced) scale.value = withTiming(scaleTo, { duration: motion.press });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        scale.value = reduced ? 1 : withSpring(1, motion.settle);
        onPressOut?.(event);
      }}
      ref={ref}
      style={[typeof style === "function" ? style({ pressed, hovered }) : style, animatedStyle]}
    >
      {typeof children === "function" ? children({ pressed, hovered }) : children}
    </AnimatedPressable>
  );
});
