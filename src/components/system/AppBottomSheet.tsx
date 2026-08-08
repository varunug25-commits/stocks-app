/* eslint-disable react-hooks/immutability -- Reanimated shared values are intentionally mutable. */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassBackdrop } from "@/components/foundation/GlassBackdrop";
import { colors, glass, radii, spacing, typography } from "@/theme/tokens";

const DISMISS_DISTANCE = 110;

type AppBottomSheetProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
}>;

export function AppBottomSheet({ visible, title, onClose, children }: AppBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(520);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 22, stiffness: 190 });
    } else {
      translateY.value = 520;
    }
  }, [translateY, visible]);

  const close = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > 900) {
        translateY.value = withSpring(520, { damping: 24, stiffness: 180 });
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 190 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal animationType="fade" onRequestClose={close} transparent visible={visible}>
      <View accessibilityViewIsModal style={styles.modal}>
        <Pressable accessibilityLabel="Close briefing" onPress={close} style={styles.backdrop} />
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: glass.fallbackStrong,
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
    ...typography.heading,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSoft,
  },
});
