import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { AIBriefingCard } from "@/components/finance/AIBriefingCard";
import { EditorialHero } from "@/components/finance/EditorialHero";
import { EventCard } from "@/components/finance/EventCard";
import { MarketIndexCard } from "@/components/finance/MarketIndexCard";
import { SourceCitation } from "@/components/finance/SourceCitation";
import { StockRow } from "@/components/finance/StockRow";
import { StoryCard } from "@/components/finance/StoryCard";
import { IconButton } from "@/components/foundation/IconButton";
import { DemoDataBadge, ErrorState, OfflineBanner } from "@/components/foundation/Feedback";
import { Screen } from "@/components/foundation/Screen";
import { SectionHeader } from "@/components/foundation/SectionHeader";
import { AppBottomSheet } from "@/components/system/AppBottomSheet";
import { EmptyState } from "@/components/system/EmptyState";
import { SkeletonState } from "@/components/system/SkeletonState";
import { MarketClosedState } from "@/components/market/MarketClosedState";
import { MarketStatusBadge } from "@/components/market/MarketStatusBadge";
import { TimestampLabel } from "@/components/market/TimestampLabel";
import { marketStatus } from "@/data/markets";
import { searchableStocks } from "@/data/search";
import { briefingPoints, events, leadStory, marketIndices, stories, watchlist } from "@/data/today";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

const enter = (delay: number) => FadeInDown.duration(420).delay(delay).springify().damping(18);

export default function TodayScreen() {
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { state } = useOnboarding();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(false);

  useEffect(() => {
    if (preview === "loading") return;
    const timer = setTimeout(() => setIsLoading(false), 650);
    return () => clearTimeout(timer);
  }, [preview]);

  const personalizedStocks = useMemo(() => {
    if (!state.stocks.length) return watchlist;
    return state.stocks.map(symbol => {
      const existing = watchlist.find(stock => stock.symbol === symbol);
      if (existing) return existing;
      const stock = searchableStocks.find(item => item.symbol === symbol);
      return stock ? { ...stock, trend: stock.changePercent >= 0 ? [20, 22, 21, 25, 28, 27, 32, 36] : [39, 37, 38, 34, 32, 33, 29, 27] } : null;
    }).filter((stock): stock is (typeof watchlist)[number] => Boolean(stock));
  }, [state.stocks]);
  const greeting = state.experience === "New investor" ? "Good morning, new investor" : state.experience === "Advanced" ? "Good morning, market pro" : state.experience === "Intermediate" ? "Good morning, market watcher" : "Good morning, investor";
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();

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

  if (isLoading || preview === "loading") {
    return (
      <Screen>
        <SkeletonState />
      </Screen>
    );
  }

  if (preview === "error") return <Screen><View style={styles.stateWrap}><ErrorState description="Your local demo feed could not be prepared. Nothing was lost." onRetry={() => undefined} title="Today needs a refresh" /></View></Screen>;
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
          <Animated.View entering={enter(0)} style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.date}>{today}</Text>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.intro}>Here’s the market signal worth your attention.</Text>
            </View>
            <IconButton accessibilityLabel="Notifications, one new" icon="notifications-outline" notification onPress={handleMockPress} />
          </Animated.View>

          <Animated.View entering={enter(40)} style={styles.statusRow}><MarketStatusBadge status={preview === "closed" ? { ...marketStatus, state: "closed", label: "Market closed", detail: "Next session opens Monday at 9:30 AM ET" } : marketStatus} /><View style={styles.statusMeta}><DemoDataBadge /><TimestampLabel label="Updated 2 min ago" /></View></Animated.View>

          {preview === "closed" ? <View style={styles.closedWrap}><MarketClosedState /></View> : null}

          <Animated.View entering={enter(70)} style={styles.section}>
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

          <Animated.View entering={enter(130)} style={styles.section}>
            <EditorialHero onPress={handleMockPress} story={leadStory} />
          </Animated.View>

          <Animated.View entering={enter(190)} style={styles.section}>
            <AIBriefingCard onPress={() => setBriefingOpen(true)} points={briefingPoints} />
          </Animated.View>

          <Animated.View entering={enter(250)} style={styles.section}>
            <SectionHeader actionLabel="See all" onAction={handleMockPress} title="Moving in your watchlist" />
            <View style={styles.stockList}>
              {personalizedStocks.map((stock) => <StockRow key={stock.symbol} onPress={handleMockPress} stock={stock} />)}
            </View>
          </Animated.View>

          <Animated.View entering={enter(310)} style={styles.section}>
            <SectionHeader eyebrow="THIS WEEK" title="Events on your radar" />
            <View style={styles.eventList}>
              {events.map((event) => <EventCard event={event} key={event.id} />)}
            </View>
          </Animated.View>

          <Animated.View entering={enter(370)} style={styles.section}>
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

          <Animated.View entering={enter(430)} style={styles.disclaimer}>
            <Ionicons color={colors.textTertiary} name="shield-checkmark-outline" size={17} />
            <Text style={styles.disclaimerText}>Demo market data and editorial content. MarketBrief provides education, not investment advice.</Text>
          </Animated.View>
        </View>
      </ScrollView>

      <AppBottomSheet onClose={() => setBriefingOpen(false)} title="Your 60-second brief" visible={briefingOpen}>
        <View style={styles.sheetIntro}>
          <View style={styles.sheetLabel}>
            <Ionicons color={colors.teal} name="sparkles" size={14} />
            <Text style={styles.sheetLabelText}>LOCAL MOCK BRIEFING</Text>
          </View>
          <Text style={styles.sheetTitle}>A constructive open, with one thing to watch.</Text>
          <SourceCitation published="Updated for demo" source="MarketBrief Editorial" />
        </View>
        <View style={styles.pointList}>
          {briefingPoints.map((point, index) => (
            <View key={point} style={styles.pointRow}>
              <View style={styles.pointNumber}><Text style={styles.pointNumberText}>{index + 1}</Text></View>
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>
        <View style={styles.sheetNote}>
          <Ionicons color={colors.warning} name="information-circle-outline" size={18} />
          <Text style={styles.sheetNoteText}>This is handcrafted mock copy. No AI model or external market service is connected.</Text>
        </View>
      </AppBottomSheet>
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
  sheetIntro: {
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sheetLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sheetLabelText: {
    ...typography.caption,
    color: colors.teal,
    letterSpacing: 0.85,
  },
  sheetTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  pointList: {
    paddingVertical: spacing.sm,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  pointNumber: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.tealMuted,
  },
  pointNumberText: {
    ...typography.caption,
    color: colors.teal,
  },
  pointText: {
    ...typography.body,
    flex: 1,
    color: colors.textSecondary,
  },
  sheetNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: "#2E2717",
    borderWidth: 1,
    borderColor: "#5A4923",
  },
  sheetNoteText: {
    ...typography.caption,
    flex: 1,
    color: "#D8C79B",
  },
});
