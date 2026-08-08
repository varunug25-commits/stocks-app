# Shared Layouts

## `src/app/_layout.tsx`

Root provider, navigation stack and dark theme shell.

```tsx
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "@/theme/tokens";
import { OnboardingProvider } from "@/features/onboarding/OnboardingProvider";
import { WatchlistProvider } from "@/features/watchlist/WatchlistProvider";
import { BriefsProvider } from "@/features/briefs/BriefsProvider";
import { MarketDataProvider } from "@/features/market-data/MarketDataProvider";

export const unstable_settings = { initialRouteName: "splash" };

const marketBriefTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.teal,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.warning,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={marketBriefTheme}>
          <OnboardingProvider>
          <WatchlistProvider>
          <MarketDataProvider>
          <BriefsProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="splash" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="search" />
            <Stack.Screen name="stock/[symbol]" />
            <Stack.Screen name="stock/[symbol]/why" />
            <Stack.Screen name="brief/[briefId]" />
          </Stack>
          </BriefsProvider>
          </MarketDataProvider>
          </WatchlistProvider>
          </OnboardingProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

## `src/app/(tabs)/_layout.tsx`

Five-tab Expo Router layout.

```tsx
import { Tabs } from "expo-router";

import { BottomTabBar } from "@/components/navigation/BottomTabBar";

export default function TabLayout() {
  return (
    <Tabs backBehavior="history" screenOptions={{ headerShown: false }} tabBar={(props) => <BottomTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="markets" options={{ title: "Markets" }} />
      <Tabs.Screen name="watchlist" options={{ title: "Watchlist" }} />
      <Tabs.Screen name="briefs" options={{ title: "Briefs" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
```

## `src/components/navigation/BottomTabBar.tsx`

Custom native bottom tab navigation shared by all primary screens.

```tsx
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radii, spacing, typography } from "@/theme/tokens";

const icons = {
  index: ["sparkles-outline", "sparkles"],
  markets: ["pulse-outline", "pulse"],
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
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons color={focused ? colors.background : colors.textTertiary} name={routeIcons[focused ? 1 : 0]} size={20} />
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
    minHeight: 68,
    flexDirection: "row",
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    backgroundColor: "#0A1012FA",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  tab: { flex: 1, minWidth: 56, minHeight: 54, alignItems: "center", justifyContent: "center", gap: 3 },
  pressed: { opacity: 0.68 },
  iconWrap: { width: 36, height: 28, alignItems: "center", justifyContent: "center", borderRadius: radii.pill },
  iconWrapActive: { backgroundColor: colors.teal },
  label: { ...typography.caption, color: colors.textTertiary, fontSize: 10, lineHeight: 13 },
  labelActive: { color: colors.teal, fontWeight: "700" },
});
```
