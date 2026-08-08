import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing, typography } from "@/theme/tokens";

const icons = {
  index: ["today-outline", "today"],
  markets: ["stats-chart-outline", "stats-chart"],
  watchlist: ["bookmark-outline", "bookmark"],
  briefs: ["newspaper-outline", "newspaper"],
  profile: ["person-outline", "person"],
} as const;

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View accessibilityRole="tablist" style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const options = descriptors[route.key]?.options;
        const title = typeof options?.title === "string" ? options.title : route.name;
        const routeIcons = icons[route.name as keyof typeof icons] ?? icons.index;
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            void Haptics.selectionAsync();
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            accessibilityLabel={`${title} tab`}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            key={route.key}
            onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
            onPress={onPress}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            {focused ? <View style={styles.activeIndicator} /> : null}
            <View style={styles.iconWrap}>
              <Ionicons color={focused ? colors.teal : colors.textTertiary} name={routeIcons[focused ? 1 : 0]} size={20} />
            </View>
            <Text numberOfLines={1} style={[styles.label, focused && styles.labelActive]}>{title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    flexDirection: "row",
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    backgroundColor: "#090D0FF5",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  tab: { flex: 1, minWidth: 56, minHeight: 54, alignItems: "center", justifyContent: "center", gap: 3 },
  pressed: { opacity: 0.68 },
  activeIndicator: { position: "absolute", top: -spacing.xs, width: 24, height: 2, borderRadius: 1, backgroundColor: colors.teal },
  iconWrap: { width: 36, height: 28, alignItems: "center", justifyContent: "center" },
  label: { ...typography.caption, color: colors.textTertiary, fontSize: 10, lineHeight: 13 },
  labelActive: { color: colors.teal, fontWeight: "700" },
});
