import { Tabs } from "expo-router";

import { BottomTabBar } from "@/components/navigation/BottomTabBar";

export default function TabLayout() {
  return (
    <Tabs backBehavior="history" screenOptions={{ headerShown: false }} tabBar={(props) => <BottomTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="markets" options={{ title: "Pulse" }} />
      <Tabs.Screen name="watchlist" options={{ title: "Watchlist" }} />
      <Tabs.Screen name="briefs" options={{ title: "Briefs" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
