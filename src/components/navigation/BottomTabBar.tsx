import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { useEffect, type ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassBackdrop } from "@/components/foundation/GlassBackdrop";
import { MotionPressable, SelectionTrack, useMeasuredWidth } from "@/components/motion";
import { colors, glass, motion, spacing, typography } from "@/theme/tokens";

const icons = {
  index: ["today-outline", "today"],
  markets: ["stats-chart-outline", "stats-chart"],
  watchlist: ["bookmark-outline", "bookmark"],
  briefs: ["newspaper-outline", "newspaper"],
  profile: ["person-outline", "person"],
} as const;

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];
type TabIconPair = (typeof icons)[keyof typeof icons];

const DOCK_PADDING = 4;
const TAB_HEIGHT = 56;

function TabItem({
  focused,
  title,
  routeIcons,
  onPress,
  onLongPress,
}: {
  focused: boolean;
  title: string;
  routeIcons: TabIconPair;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const selection = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    selection.value = reduceMotion ? Number(focused) : withSpring(Number(focused), {
      ...motion.settle,
      overshootClamping: true,
    });
    return () => cancelAnimation(selection);
  }, [focused, reduceMotion, selection]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: reduceMotion ? 0 : -1.5 * selection.value },
      { scale: reduceMotion ? 1 : 1 + 0.045 * selection.value },
    ],
  }));

  return (
    <MotionPressable
      accessibilityLabel={`${title} tab`}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      aria-selected={focused}
      onLongPress={onLongPress}
      onPress={onPress}
      scaleTo={0.96}
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
    >
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <Ionicons color={focused ? colors.teal : colors.textTertiary} name={routeIcons[focused ? 1 : 0]} size={22} />
      </Animated.View>
      <Text numberOfLines={1} style={[styles.label, focused && styles.labelActive]}>{title}</Text>
    </MotionPressable>
  );
}

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { ref, onLayout, width } = useMeasuredWidth();
  const tabWidth = Math.max(0, width - DOCK_PADDING * 2) / Math.max(state.routes.length, 1);
  const frame = width > 0 ? {
    x: DOCK_PADDING + state.index * tabWidth,
    y: DOCK_PADDING,
    width: tabWidth,
    height: TAB_HEIGHT,
  } : null;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
      <View accessibilityRole="tablist" onLayout={onLayout} ref={ref} style={styles.dock}>
        <GlassBackdrop intensity={24} />
        <View pointerEvents="none" style={styles.activeIndicator}>
          <SelectionTrack frame={frame} radius={14} tone="teal" />
        </View>
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const options = descriptors[route.key]?.options;
            const title = typeof options?.title === "string" ? options.title : route.name;
            const routeIcons = icons[route.name as keyof typeof icons] ?? icons.index;
            const onPress = () => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                void Haptics.selectionAsync().catch(() => undefined);
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <TabItem
                focused={focused}
                key={route.key}
                onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
                onPress={onPress}
                routeIcons={routeIcons}
                title={title}
              />
            );
          })}
        </View>
        <View pointerEvents="none" style={styles.dockBorder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.background,
  },
  dock: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    padding: DOCK_PADDING,
    borderRadius: 20,
    backgroundColor: glass.fallbackStrong,
    overflow: "hidden",
  },
  dockBorder: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: 20, borderWidth: 1, borderColor: glass.border },
  row: { flexDirection: "row", minHeight: TAB_HEIGHT },
  tab: { flex: 1, minWidth: 44, minHeight: TAB_HEIGHT, alignItems: "center", justifyContent: "center", gap: 3 },
  pressed: { opacity: 0.8 },
  activeIndicator: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  iconWrap: { width: 36, height: 25, alignItems: "center", justifyContent: "center" },
  label: { ...typography.caption, color: colors.textTertiary, fontSize: 11, lineHeight: 16 },
  labelActive: { color: colors.teal, fontWeight: "700" },
});
