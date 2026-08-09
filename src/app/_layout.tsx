import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "@/theme/tokens";
import { OnboardingProvider } from "@/features/onboarding/OnboardingProvider";
import { WatchlistProvider } from "@/features/watchlist/WatchlistProvider";
import { BriefsProvider } from "@/features/briefs/BriefsProvider";
import { MarketDataProvider } from "@/features/market-data/MarketDataProvider";
import { IntelligenceProvider } from "@/features/intelligence/IntelligenceProvider";
import { publicDataConfig } from "@/data/real";
import { ConfigurationUnavailable } from "@/components/system/ConfigurationUnavailable";
import { ChangeDetectionProvider } from "@/features/materiality";
import { ThesisProvider } from "@/features/thesis";

export const unstable_settings = { initialRouteName: "splash" };

const marketBriefTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.warning,
  },
};

export default function RootLayout() {
  if (publicDataConfig.configurationError) return (
    <SafeAreaProvider>
      <ConfigurationUnavailable />
    </SafeAreaProvider>
  );
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <ThemeProvider value={marketBriefTheme}>
          <OnboardingProvider>
          <WatchlistProvider>
          <MarketDataProvider>
          <ChangeDetectionProvider>
          <ThesisProvider>
          <IntelligenceProvider>
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
            <Stack.Screen name="ask" />
          </Stack>
          </BriefsProvider>
          </IntelligenceProvider>
          </ThesisProvider>
          </ChangeDetectionProvider>
          </MarketDataProvider>
          </WatchlistProvider>
          </OnboardingProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
