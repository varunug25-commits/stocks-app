import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";

import { AIBriefingCard } from "@/components/finance/AIBriefingCard";
import { EditorialHero } from "@/components/finance/EditorialHero";
import { EventCard } from "@/components/finance/EventCard";
import { MarketIndexCard } from "@/components/finance/MarketIndexCard";
import { StockRow } from "@/components/finance/StockRow";
import { StoryCard } from "@/components/finance/StoryCard";
import { IconButton } from "@/components/foundation/IconButton";
import { DemoDataBadge, ErrorState, OfflineBanner } from "@/components/foundation/Feedback";
import { Screen } from "@/components/foundation/Screen";
import { SectionHeader } from "@/components/foundation/SectionHeader";
import { EmptyState } from "@/components/system/EmptyState";
import { SkeletonState } from "@/components/system/SkeletonState";
import { MarketClosedState } from "@/components/market/MarketClosedState";
import { MarketStatusBadge } from "@/components/market/MarketStatusBadge";
import { TimestampLabel } from "@/components/market/TimestampLabel";
import { marketStatus } from "@/data/markets";
import { events, leadStory, marketIndices, stories } from "@/data/today";
import { generateBrief, latestBriefSeed } from "@/data/briefs";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import { selectTodayWatchlist } from "@/features/watchlist/todayStocks";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

const enter = (delay: number) => FadeInDown.duration(420).delay(delay).springify().damping(18);

export default function TodayScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { state: onboardingState } = useOnboarding();
  const { state: watchlistState, hydrated: watchlistHydrated } = useWatchlist();
  const reduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (preview === "loading") return;
    const timer = setTimeout(() => setIsLoading(false), 650);
    return () => clearTimeout(timer);
  }, [preview]);

  const personalizedStocks = useMemo(
    () => selectTodayWatchlist(watchlistState.symbols),
    [watchlistState.symbols],
  );
  const morningBrief = useMemo(
    () => generateBrief(latestBriefSeed("morning"), watchlistState.symbols),
    [watchlistState.symbols],
  );
  const greeting = onboardingState.experience === "New investor" ? "Good morning, new investor" : onboardingState.experience === "Advanced" ? "Good morning, market pro" : onboardingState.experience === "Intermediate" ? "Good morning, market watcher" : "Good morning, investor";
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
  const animation = (delay: number) => reduceMotion ? undefined : enter(delay);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      setIsRefreshing(false);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 800);
  };

  const handleMockPress = () => {
    void Haptics.selectionAsync();
  };

  const handleRetry = () => {
    setIsLoading(true);
    router.replace("/" as Href);
    setTimeout(() => setIsLoading(false), 650);
  };

  if (isLoading || !watchlistHydrated || preview === "loading") {
    return (
      <Screen>
        <SkeletonState />
      </Screen>
    );
  }

  if (preview === "error") return <Screen><View style={styles.stateWrap}><ErrorState description="Your local demo feed could not be prepared. Nothing was lost." onRetry={handleRetry} title="Today needs a refresh" /></View></Screen>;
  if (preview === "empty") return <Screen><View style={styles.stateWrap}><EmptyState description="Choose companies in Watchlist to make this feed yours." title="Your feed is ready to personalize" /></View></Screen>;

  return (
    <Screen>
      {preview === "offline" ? <OfflineBanner /> : null}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            colors={[colors.teal]}
            onRefresh={handleRefresh}
            progressBackgroundColor={colors.surfaceElevated}
            refreshing={isRefreshing}
            tintColor={colors.teal}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentColumn}>
          <Animated.View entering={animation(0)} style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.date}>{today}</Text>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.intro}>Here’s the market signal worth your attention.</Text>
            </View>
            <View style={styles.headerActions}><IconButton accessibilityLabel="Search stocks" icon="search" onPress={() => router.push("/search" as Href)} /><IconButton accessibilityLabel="Notifications, one new" icon="notifications-outline" notification onPress={handleMockPress} /></View>
          </Animated.View>

          <Animated.View entering={animation(40)} style={styles.statusRow}><MarketStatusBadge status={preview === "closed" ? { ...marketStatus, state: "closed", label: "Market closed", detail: "Next session opens Monday at 9:30 AM ET" } : marketStatus} /><View style={styles.statusMeta}><DemoDataBadge /><TimestampLabel label="Updated 2 min ago" /></View></Animated.View>

          {preview === "closed" ? <View style={styles.closedWrap}><MarketClosedState /></View> : null}

          <Animated.View entering={animation(70)} style={styles.section}>
            <SectionHeader eyebrow="LIVE SNAPSHOT" title="Market pulse" />
            <ScrollView
              contentContainerStyle={styles.horizontalContent}
              decelerationRate="fast"
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={216}
            >
              {marketIndices.map((index) => <MarketIndexCard index={index} key={index.id} />)}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={animation(130)} style={styles.section}>
            <EditorialHero onPress={handleMockPress} story={leadStory} />
          </Animated.View>

          <Animated.View entering={animation(190)} style={styles.section}>
            <AIBriefingCard
              brief={morningBrief}
              onPress={() => router.push(`/brief/${morningBrief.id}` as Href)}
            />
          </Animated.View>

          <Animated.View entering={animation(250)} style={styles.section}>
            <SectionHeader actionLabel="See all" onAction={() => router.push("/watchlist" as Href)} title="Moving in your watchlist" />
            {personalizedStocks.length ? (
              <View style={styles.stockList}>
                {personalizedStocks.map((stock) => <StockRow key={stock.symbol} onPress={() => router.push(`/stock/${stock.symbol}` as Href)} stock={stock} />)}
              </View>
            ) : (
              <EmptyState
                actionLabel="Search stocks"
                description="Add companies to your shared watchlist to see their daily moves here."
                onAction={() => router.push("/search" as Href)}
                title="Your watchlist is clear"
              />
            )}
          </Animated.View>

          <Animated.View entering={animation(310)} style={styles.section}>
            <SectionHeader eyebrow="THIS WEEK" title="Events on your radar" />
            <View style={styles.eventList}>
              {events.map((event) => <EventCard event={event} key={event.id} />)}
            </View>
          </Animated.View>

          <Animated.View entering={animation(370)} style={styles.section}>
            <SectionHeader actionLabel="Explore" onAction={handleMockPress} title="Keep reading" />
            <ScrollView
              contentContainerStyle={styles.horizontalContent}
              decelerationRate="fast"
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={280}
            >
              {stories.map((story) => <StoryCard key={story.id} onPress={handleMockPress} story={story} />)}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={animation(430)} style={styles.disclaimer}>
            <Ionicons color={colors.textTertiary} name="shield-checkmark-outline" size={17} />
            <Text style={styles.disclaimerText}>Demo market data and editorial content. MarketBrief provides education, not investment advice.</Text>
          </Animated.View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 118,
  },
  contentColumn: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  header: {
    minHeight: 126,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  headerActions: { flexDirection: "row", gap: spacing.xs },
  date: {
    ...typography.caption,
    color: colors.teal,
    letterSpacing: 1.05,
  },
  greeting: {
    ...typography.title,
    color: colors.textPrimary,
    letterSpacing: -0.55,
    marginTop: spacing.xs,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  section: {
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, paddingHorizontal: spacing.lg },
  statusMeta: { alignItems: "flex-end", gap: spacing.xxs },
  closedWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  stateWrap: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.lg },
  horizontalContent: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  stockList: {
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  eventList: {
    gap: spacing.sm,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginTop: spacing.xxxl,
    marginHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  disclaimerText: {
    ...typography.caption,
    flex: 1,
    color: colors.textTertiary,
  },
});
