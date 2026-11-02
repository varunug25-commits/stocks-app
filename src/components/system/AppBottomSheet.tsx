/* eslint-disable react-hooks/immutability -- Reanimated shared values are intentionally mutable. */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { cancelAnimation, Easing, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassBackdrop } from "@/components/foundation/GlassBackdrop";
import { colors, glass, radii, spacing, typography } from "@/theme/tokens";

const DISMISS_DISTANCE = 110;
const SHEET_SPRING = { damping: 25, stiffness: 240, mass: 0.85 };
const CLOSE_DURATION = 220;

type AppBottomSheetProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
}>;

export function AppBottomSheet({ visible, title, onClose, children }: AppBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const hiddenOffset = Math.max(height, 520);
  const [presented, setPresented] = useState(visible);
  const presentedRef = useRef(visible);
  const mountedRef = useRef(true);
  const closingRef = useRef(false);
  const notifyCloseRef = useRef(false);
  const transitionRef = useRef(0);
  const onCloseRef = useRef(onClose);
  const translateY = useSharedValue(reduceMotion ? 0 : hiddenOffset);
  const backdropOpacity = useSharedValue(reduceMotion && visible ? 1 : 0);
  const isClosing = useSharedValue(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const finishDismiss = useCallback((transition: number) => {
    if (!mountedRef.current || transition !== transitionRef.current) return;
    presentedRef.current = false;
    setPresented(false);
    const notify = notifyCloseRef.current;
    notifyCloseRef.current = false;
    if (notify) onCloseRef.current();
  }, []);

  const dismiss = useCallback((notify: boolean) => {
    if (!presentedRef.current) return false;
    if (closingRef.current) {
      // A parent-driven close supersedes a pending user callback.
      if (!notify) notifyCloseRef.current = false;
      return false;
    }
    closingRef.current = true;
    notifyCloseRef.current = notify;
    isClosing.value = true;
    const transition = ++transitionRef.current;
    cancelAnimation(translateY);
    cancelAnimation(backdropOpacity);
    if (reduceMotion) {
      backdropOpacity.value = 0;
      translateY.value = 0;
      finishDismiss(transition);
    } else {
      backdropOpacity.value = withTiming(0, { duration: CLOSE_DURATION });
      translateY.value = withTiming(hiddenOffset, { duration: CLOSE_DURATION, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(finishDismiss)(transition);
      });
    }
    return true;
  }, [backdropOpacity, finishDismiss, hiddenOffset, isClosing, reduceMotion, translateY]);

  const close = useCallback(() => {
    if (dismiss(true)) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }, [dismiss]);

  const open = useCallback(() => {
    if (closingRef.current || !visible) return;
    translateY.value = reduceMotion ? 0 : withSpring(0, SHEET_SPRING);
    backdropOpacity.value = reduceMotion ? 1 : withTiming(1, { duration: 180 });
  }, [backdropOpacity, reduceMotion, translateY, visible]);

  useEffect(() => {
    if (visible) {
      const alreadyPresented = presentedRef.current;
      ++transitionRef.current;
      cancelAnimation(translateY);
      cancelAnimation(backdropOpacity);
      closingRef.current = false;
      notifyCloseRef.current = false;
      isClosing.value = false;
      presentedRef.current = true;
      // Keep the controlled Modal mounted long enough to show its exit transition.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Native Modal presentation must outlive the controlled visible prop while exiting.
      setPresented(true);
      if (alreadyPresented) {
        open();
      } else {
        translateY.value = reduceMotion ? 0 : hiddenOffset;
        backdropOpacity.value = reduceMotion ? 1 : 0;
      }
    } else {
      dismiss(false);
    }
  }, [backdropOpacity, dismiss, hiddenOffset, isClosing, open, reduceMotion, translateY, visible]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelAnimation(translateY);
      cancelAnimation(backdropOpacity);
    };
  }, [backdropOpacity, translateY]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (!isClosing.value && !reduceMotion) translateY.value = Math.max(0, event.translationY);
    })
    // Gesture handlers execute after render; runOnJS bridges to the guarded event callback.
    // eslint-disable-next-line react-hooks/refs
    .onEnd((event) => {
      if (isClosing.value) return;
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > 900) {
        runOnJS(close)();
      } else {
        translateY.value = reduceMotion ? 0 : withSpring(0, SHEET_SPRING);
      }
    })
    .onFinalize((_event, success) => {
      if (!success && !isClosing.value) translateY.value = reduceMotion ? 0 : withSpring(0, SHEET_SPRING);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: reduceMotion ? 0 : translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  return (
    <Modal animationType="none" onRequestClose={close} onShow={open} transparent visible={presented}>
      <View accessibilityViewIsModal style={styles.modal}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable accessibilityLabel={`Dismiss ${title}`} accessibilityRole="button" onPress={close} style={StyleSheet.absoluteFill} />
        </Animated.View>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }, animatedStyle]}>
            <GlassBackdrop intensity={28} />
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={close} style={styles.closeButton}>
                <Ionicons color={colors.textSecondary} name="close" size={22} />
              </Pressable>
            </View>
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#000000A8",
  },
  sheet: {
    maxHeight: "82%",
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Platform.OS === "ios" ? glass.fallbackStrong : colors.surface,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: glass.border,
    overflow: "hidden",
  },
  handle: {
    width: 42,
    height: 5,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    flex: 1,
    minWidth: 0,
    ...typography.heading,
    color: colors.textPrimary,
  },
  closeButton: {
    flexShrink: 0,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSoft,
  },
});
