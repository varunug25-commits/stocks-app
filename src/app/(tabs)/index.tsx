import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";

import { EventCard } from "@/components/finance/EventCard";
import { MarketIndexCard } from "@/components/finance/MarketIndexCard";
import { StockRow } from "@/components/finance/StockRow";
import { StoryCard } from "@/components/finance/StoryCard";
import { DemoDataBadge, ErrorState, OfflineBanner } from "@/components/foundation/Feedback";
import { IconButton } from "@/components/foundation/IconButton";
import { ProductHeader } from "@/components/foundation/ProductHeader";
import { Screen } from "@/components/foundation/Screen";
import { SectionHeader } from "@/components/foundation/SectionHeader";
import { MarketStatusBadge } from "@/components/market/MarketStatusBadge";
import { ResourceStateNotice } from "@/components/market/ResourceStateNotice";
import { EmptyState } from "@/components/system/EmptyState";
import { SkeletonState } from "@/components/system/SkeletonState";
import { generateBrief, latestBriefSeed } from "@/data/briefs";
import { marketStatus } from "@/data/markets";
import { isStockSymbol } from "@/data/stocks";
import { events, leadStory, marketIndices, stories } from "@/data/today";
import { useMarketData } from "@/features/market-data/MarketDataProvider";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import { selectTodayWatchlist } from "@/features/watchlist/todayStocks";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

const enter = (delay: number) => FadeInDown.duration(300).delay(delay);

export default function TodayScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { state: onboardingState } = useOnboarding();
  const { state: watchlistState, hydrated: watchlistHydrated } = useWatchlist();
  const { mode, quotes, loadQuotes } = useMarketData();
  const reduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (preview === "loading") return;
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, [preview]);

  useEffect(() => {
    if (watchlistHydrated) void loadQuotes(watchlistState.symbols);
  }, [loadQuotes, watchlistHydrated, watchlistState.symbols]);

  const personalizedStocks = useMemo(
    () => selectTodayWatchlist(watchlistState.symbols),
    [watchlistState.symbols],
  );
  const morningBrief = useMemo(
    () => generateBrief(latestBriefSeed("morning"), watchlistState.symbols),
    [watchlistState.symbols],
  );
  const breadth = useMemo(() => {
    let higher = 0;
    let lower = 0;
    for (const symbol of watchlistState.symbols) {
      const resource = quotes[symbol];
      if (resource?.status !== "ready" && resource?.status !== "stale") continue;
      const change = resource.data.changePercent;
      if (change === null) continue;
      if (change > 0) higher += 1;
      if (change < 0) lower += 1;
    }
    return higher + lower ? `${higher} higher · ${lower} lower` : "Quotes loading";
  }, [quotes, watchlistState.symbols]);
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const experience = onboardingState.experience
    ? `${onboardingState.experience} investor view`
    : "Your personalized market day";
  const animation = (delay: number) => reduceMotion ? undefined : enter(delay);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await loadQuotes(watchlistState.symbols);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    router.replace("/" as Href);
    setTimeout(() => setIsLoading(false), 450);
  };

  if (isLoading || !watchlistHydrated || preview === "loading") {
    return <Screen><SkeletonState /></Screen>;
  }
  if (preview === "error") {
    return <Screen><View style={styles.stateWrap}><ErrorState description="Your feed could not be prepared. Your saved watchlist is unchanged." onRetry={handleRetry} title="Today needs a refresh" /></View></Screen>;
  }
  if (preview === "empty") {
    return <Screen><View style={styles.stateWrap}><EmptyState description="Choose companies in Watchlist to make this feed yours." title="Your feed is ready to personalize" /></View></Screen>;
  }

  const status = mode === "REAL"
    ? { ...marketStatus, state: "closed" as const, label: "Index status unavailable", detail: "No licensed index-status feed connected", updated: "Unavailable" }
    : preview === "closed"
      ? { ...marketStatus, state: "closed" as const, label: "Market closed", detail: "Next regular session shown in local demo data" }
      : marketStatus;

  return (
    <Screen>
      {preview === "offline" ? <OfflineBanner /> : null}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl colors={[colors.teal]} onRefresh={() => void handleRefresh()} progressBackgroundColor={colors.surfaceElevated} refreshing={isRefreshing} tintColor={colors.teal} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentColumn}>
          <Animated.View entering={animation(0)}>
            <ProductHeader
              actions={<><IconButton accessibilityLabel="Search stocks" icon="search" onPress={() => router.push("/search" as Href)} /><IconButton accessibilityLabel="Notifications preference" icon="notifications-outline" onPress={() => router.push("/profile" as Href)} /></>}
              eyebrow={today}
              subtitle={experience}
              title="MarketBrief"
            />
          </Animated.View>

          <Animated.View entering={animation(30)} style={styles.section}>
            <SectionHeader eyebrow={mode === "REAL" ? "ILLUSTRATIVE INDICES" : "LOCAL DEMO · 1D"} title="Market overview" />
            <View style={styles.statusLine}>
              <MarketStatusBadge status={status} />
              {mode === "DEMO" ? <DemoDataBadge /> : null}
            </View>
            <ScrollView contentContainerStyle={styles.horizontalContent} horizontal showsHorizontalScrollIndicator={false}>
              {marketIndices.map((index) => <MarketIndexCard index={index} key={index.id} />)}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={animation(60)} style={[styles.section, styles.watchlistSection]}>
            <View style={styles.watchlistHeading}>
              <View>
                <Text style={styles.watchlistTitle}>Watchlist summary</Text>
                <Text style={styles.watchlistMeta}>{breadth} · 1D moves</Text>
              </View>
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push("/watchlist" as Href)} style={styles.textAction}><Text style={styles.textActionLabel}>View all</Text></Pressable>
            </View>
            {watchlistState.symbols[0] ? <ResourceStateNotice onRetry={() => void loadQuotes(watchlistState.symbols)} resource={quotes[watchlistState.symbols[0]]} /> : null}
            {personalizedStocks.length ? (
              <View style={styles.stockList}>
                {personalizedStocks.map((stock) => <StockRow key={stock.symbol} onPress={() => router.push(`/stock/${stock.symbol}` as Href)} quote={isStockSymbol(stock.symbol) ? quotes[stock.symbol] : undefined} stock={stock} />)}
              </View>
            ) : (
              <EmptyState actionLabel="Search stocks" description="Add companies to see prices and daily moves here." onAction={() => router.push("/search" as Href)} title="Your watchlist is clear" />
            )}
          </Animated.View>

          <Animated.View entering={animation(90)} style={styles.section}>
            <SectionHeader eyebrow="LOCAL EDITORIAL DEMO" title="What changed" />
            <StoryCard story={leadStory} />
            {stories.map((story) => <StoryCard key={story.id} story={story} />)}
          </Animated.View>

          <Animated.View entering={animation(120)} style={styles.section}>
            <SectionHeader eyebrow="EARNINGS & MACRO" title="Next up" />
            <View>{events.map((event) => <EventCard event={event} key={event.id} />)}</View>
          </Animated.View>

          <Animated.View entering={animation(150)} style={[styles.section, styles.briefSection]}>
            <View style={styles.briefHeading}>
              <View>
                <Text style={styles.briefEyebrow}>MORNING BRIEF · {morningBrief.timestamp}</Text>
                <Text style={styles.briefTitle}>{morningBrief.headline}</Text>
              </View>
            </View>
            {morningBrief.developments.map((point, index) => (
              <View key={point} style={styles.briefPoint}>
                <Text style={styles.briefNumber}>{String(index + 1).padStart(2, "0")}</Text>
                <Text style={styles.briefPointText}>{point}</Text>
              </View>
            ))}
            <Pressable accessibilityRole="button" onPress={() => router.push(`/brief/${morningBrief.id}` as Href)} style={styles.briefLink}>
              <Text style={styles.briefLinkText}>Read full publication</Text>
              <Ionicons color={colors.teal} name="arrow-forward" size={17} />
            </Pressable>
          </Animated.View>

          <View style={styles.disclaimer}>
            <Ionicons color={colors.textTertiary} name="shield-checkmark-outline" size={16} />
            <Text style={styles.disclaimerText}>{mode === "REAL" ? "Company quotes come from MarketBrief’s backend when available. Indices, calendar items and editorial explanations remain clearly illustrative." : "Local illustrative market and editorial content. Educational information, not investment advice."}</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 104, backgroundColor: colors.background },
  contentColumn: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg },
  stateWrap: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.lg },
  section: { gap: spacing.xs, marginTop: spacing.xl },
  statusLine: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  horizontalContent: { gap: spacing.xs, paddingRight: spacing.lg },
  watchlistSection: { padding: spacing.md, borderRadius: radii.lg, backgroundColor: "#0D1315F2", borderWidth: 1, borderColor: colors.border },
  watchlistHeading: { minHeight: 44, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.sm },
  watchlistTitle: { ...typography.heading, color: colors.textPrimary },
  watchlistMeta: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  textAction: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.xs, marginTop: -8 },
  textActionLabel: { ...typography.label, color: colors.teal },
  stockList: { overflow: "hidden" },
  briefSection: { paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  briefHeading: { marginBottom: spacing.xs },
  briefEyebrow: { ...typography.caption, color: colors.textTertiary, letterSpacing: 0.75 },
  briefTitle: { ...typography.heading, color: colors.textPrimary, marginTop: 3 },
  briefPoint: { minHeight: 56, flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSoft },
  briefNumber: { ...typography.label, color: colors.textSecondary, width: 26 },
  briefPointText: { ...typography.body, flex: 1, color: colors.textSecondary },
  briefLink: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  briefLinkText: { ...typography.label, color: colors.teal },
  disclaimer: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs, marginTop: spacing.xxl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  disclaimerText: { ...typography.caption, flex: 1, color: colors.textTertiary },
});
