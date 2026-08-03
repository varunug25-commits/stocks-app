import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { colors, typography } from "@/theme/tokens";

const tabIcons = {
  index: ["sparkles-outline", "sparkles"],
  markets: ["pulse-outline", "pulse"],
  watchlist: ["bookmark-outline", "bookmark"],
  profile: ["person-outline", "person"],
} as const;

export default function TabLayout() {
  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          void Haptics.selectionAsync();
        },
      }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          ...typography.caption,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 86 : 70,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
          backgroundColor: "#0A1012F5",
          borderTopColor: colors.borderSoft,
        },
        tabBarIcon: ({ color, focused, size }) => {
          const iconSet = tabIcons[route.name as keyof typeof tabIcons] ?? tabIcons.index;
          return <Ionicons color={color} name={iconSet[focused ? 1 : 0]} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="markets" options={{ title: "Markets" }} />
      <Tabs.Screen name="watchlist" options={{ title: "Watchlist" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

