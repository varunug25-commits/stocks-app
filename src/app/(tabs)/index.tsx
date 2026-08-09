import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";

import { EventCard } from "@/components/finance/EventCard";
import { MarketIndexCard } from "@/components/finance/MarketIndexCard";
import { StockRow } from "@/components/finance/StockRow";
import { StoryCard } from "@/components/finance/StoryCard";
import { DemoDataBadge, ErrorState, OfflineBanner } from "@/components/foundation/Feedback";
import { GlassBackdrop } from "@/components/foundation/GlassBackdrop";
import { IconButton } from "@/components/foundation/IconButton";
import { ProductHeader } from "@/components/foundation/ProductHeader";
import { Screen } from "@/components/foundation/Screen";
import { SectionHeader } from "@/components/foundation/SectionHeader";
import { MarketStatusBadge } from "@/components/market/MarketStatusBadge";
import { ResourceStateNotice } from "@/components/market/ResourceStateNotice";
import { EmptyState } from "@/components/system/EmptyState";
import { SkeletonState } from "@/components/system/SkeletonState";
import { AskMarketBriefEntry, IntelligencePanel } from "@/components/intelligence";
import type { IntelligenceRequest } from "@/data/intelligence";
import { useIntelligenceRequest } from "@/features/intelligence/useIntelligenceRequest";
import { generateBrief, latestBriefSeed } from "@/data/briefs";
import { marketStatus } from "@/data/markets";
import { isStockSymbol } from "@/data/stocks";
import { events, leadStory, marketIndices, stories } from "@/data/today";
import { useMarketData } from "@/features/market-data/MarketDataProvider";
import { selectTodayWatchlist } from "@/features/watchlist/todayStocks";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { colors, glass, radii, spacing, typography } from "@/theme/tokens";

const enter = (delay: number) => FadeInDown.duration(300).delay(delay);

export default function TodayScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { state: watchlistState, hydrated: watchlistHydrated } = useWatchlist();
  const { mode, quotes, companies, news, events: eventResources, loadQuotes, loadCompany, loadNews, loadEvents } = useMarketData();
  const reduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (preview === "loading") return;
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, [preview]);

  useEffect(() => {
    if (!watchlistHydrated) return;
    void loadQuotes(watchlistState.symbols);
    if (mode === "REAL") void Promise.all(watchlistState.symbols.slice(0, 5).flatMap((symbol) => [loadCompany(symbol), loadNews(symbol), loadEvents(symbol)]));
  }, [loadCompany, loadEvents, loadNews, loadQuotes, mode, watchlistHydrated, watchlistState.symbols]);

  const personalizedStocks = useMemo(
    () => selectTodayWatchlist(watchlistState.symbols),
    [watchlistState.symbols],
  );
  const summaryStocks = useMemo(() => (mode === "REAL" ? watchlistState.symbols.map((symbol) => {
    const companyResource = companies[symbol];
    const company = companyResource?.status === "ready" || companyResource?.status === "stale" ? companyResource.data : null;
    return { symbol, name: company?.name ?? symbol, price: "", changePercent: 0, logoColor: colors.surfaceElevated, trend: [] };
  }) : personalizedStocks)
    .sort((left, right) => {
      const leftResource = isStockSymbol(left.symbol) ? quotes[left.symbol] : undefined;
      const rightResource = isStockSymbol(right.symbol) ? quotes[right.symbol] : undefined;
      const leftChange = leftResource?.status === "ready" || leftResource?.status === "stale"
        ? leftResource.data.changePercent
        : null;
      const rightChange = rightResource?.status === "ready" || rightResource?.status === "stale"
        ? rightResource.data.changePercent
        : null;
      const leftMove = leftChange === null ? -1 : Math.abs(leftChange);
      const rightMove = rightChange === null ? -1 : Math.abs(rightChange);
      return rightMove - leftMove;
    })
    .slice(0, 3), [companies, mode, personalizedStocks, quotes, watchlistState.symbols]);
  const realStories = useMemo(() => watchlistState.symbols.flatMap((symbol) => {
    const resource = news[symbol];
    return resource?.status === "ready" || resource?.status === "stale" ? resource.data : [];
  }).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 3), [news, watchlistState.symbols]);
  const realEvents = useMemo(() => watchlistState.symbols.flatMap((symbol) => {
    const resource = eventResources[symbol];
    return resource?.status === "ready" || resource?.status === "stale" ? resource.data : [];
  }).filter((event) => event.scheduledAt).sort((a, b) => Date.parse(a.scheduledAt!) - Date.parse(b.scheduledAt!)).slice(0, 4), [eventResources, watchlistState.symbols]);
  const morningBrief = useMemo(
    () => generateBrief(latestBriefSeed("morning"), watchlistState.symbols),
    [watchlistState.symbols],
  );
  const briefRequest = useMemo<IntelligenceRequest>(() => ({
    task: "brief",
    symbols: watchlistState.symbols.length ? watchlistState.symbols : ["AAPL"],
    edition: "morning",
    timeWindow: "1D",
  }), [watchlistState.symbols]);
  const { resource: briefResource, retry: retryBrief } = useIntelligenceRequest(briefRequest, mode === "REAL" && watchlistHydrated && watchlistState.symbols.length > 0);
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
      ? { ...marketStatus, state: "closed" as const, label: "Market closed", detail: "Next regular session shown with demo data" }
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
              subtitle="Personalized for your watchlist"
              title="MarketBrief"
            />
          </Animated.View>

          <Animated.View entering={animation(30)} style={[styles.section, styles.watchlistSection]}>
            <GlassBackdrop intensity={22} />
            <View style={styles.watchlistHeading}>
              <View>
                <Text style={styles.watchlistTitle}>Watchlist summary</Text>
                <Text style={styles.watchlistMeta}>{breadth} · 1D moves</Text>
              </View>
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.push("/watchlist" as Href)} style={styles.textAction}><Text style={styles.textActionLabel}>View all</Text></Pressable>
            </View>
            {watchlistState.symbols[0] ? <ResourceStateNotice onRetry={() => void loadQuotes(watchlistState.symbols)} resource={quotes[watchlistState.symbols[0]]} /> : null}
            {summaryStocks.length ? (
              <View style={styles.stockList}>
                {summaryStocks.map((stock) => <StockRow key={stock.symbol} onPress={() => router.push(`/stock/${stock.symbol}` as Href)} quote={isStockSymbol(stock.symbol) ? quotes[stock.symbol] : undefined} stock={stock} />)}
              </View>
            ) : (
              <EmptyState actionLabel="Search stocks" description="Add companies to see prices and daily moves here." onAction={() => router.push("/search" as Href)} title="Your watchlist is clear" />
            )}
          </Animated.View>

          <Animated.View entering={animation(45)} style={styles.askSection}>
            <AskMarketBriefEntry detail="Ask what changed across your watchlist" onPress={() => router.push("/ask" as Href)} />
          </Animated.View>

          <Animated.View entering={animation(60)} style={styles.section}>
            <SectionHeader eyebrow={mode === "REAL" ? "PROVIDER-BACKED" : "ILLUSTRATIVE PREVIEW"} title="What changed" />
            {mode === "REAL" ? realStories.length ? realStories.map((story) => <StoryCard key={story.id} onPress={story.sourceUrl ? () => void Linking.openURL(story.sourceUrl) : undefined} story={{ id: story.id, category: story.relatedSymbols[0] ?? "COMPANY", title: story.headline, summary: story.summary ?? "Open the publisher source for the full report.", source: story.publisher, published: new Date(story.publishedAt).toLocaleString(), readTime: "Source", palette: ["#000", "#000"], artwork: "grid" }} />) : <EmptyState description="No supported company news is available for your watchlist yet." title="No recent developments" /> : <><StoryCard story={leadStory} />{stories.map((story) => <StoryCard key={story.id} story={story} />)}</>}
          </Animated.View>

          <Animated.View entering={animation(90)} style={styles.section}>
            <SectionHeader eyebrow={mode === "REAL" ? "PROVIDER EVENTS" : "EARNINGS & MACRO"} title="Next up" />
            <View>{mode === "REAL" ? realEvents.length ? realEvents.map((event) => { const date = new Date(event.scheduledAt!); return <EventCard event={{ id: event.id, day: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(), date: String(date.getDate()), time: event.timing === "unknown" ? "Time unavailable" : event.timing.replace("-", " "), title: event.title, detail: event.source, symbol: event.symbol ?? undefined, tone: "earnings" }} key={event.id} />; }) : <EmptyState description="No supported upcoming events are available for your watchlist." title="No events scheduled" /> : events.map((event) => <EventCard event={event} key={event.id} />)}</View>
          </Animated.View>

          <Animated.View entering={animation(120)} style={[styles.section, styles.briefSection]}>
            {mode === "REAL" ? (
              watchlistState.symbols.length ? <IntelligencePanel onRetry={() => void retryBrief()} resource={briefResource} /> : <EmptyState description="Add companies to assemble a grounded edition." title="Morning brief needs a watchlist" />
            ) : <>
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
            </>}
            <Pressable accessibilityRole="button" onPress={() => router.push(mode === "REAL" ? "/briefs" as Href : `/brief/${morningBrief.id}` as Href)} style={styles.briefLink}>
              <Text style={styles.briefLinkText}>{mode === "REAL" ? "Open Briefs" : "Read full publication"}</Text>
              <Ionicons color={colors.teal} name="arrow-forward" size={17} />
            </Pressable>
          </Animated.View>

          {mode === "DEMO" ? <Animated.View entering={animation(150)} style={styles.section}>
            <SectionHeader eyebrow="DEMO DATA · 1D" title="Market context" />
            <View style={styles.statusLine}>
              <MarketStatusBadge status={status} />
              <DemoDataBadge />
            </View>
            <ScrollView contentContainerStyle={styles.horizontalContent} horizontal showsHorizontalScrollIndicator={false}>
              {marketIndices.map((index) => <MarketIndexCard index={index} key={index.id} />)}
            </ScrollView>
          </Animated.View> : null}

          <View style={styles.disclaimer}>
            <Ionicons color={colors.textTertiary} name="shield-checkmark-outline" size={16} />
            <Text style={styles.disclaimerText}>{mode === "REAL" ? "Company prices, news and events use configured providers when available. Missing resources remain unavailable rather than being replaced with demo values." : "Illustrative demo market and editorial content. Educational information, not investment advice."}</Text>
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
  watchlistSection: { padding: spacing.md, borderRadius: radii.lg, backgroundColor: glass.fallbackStrong, borderWidth: 1, borderColor: glass.border, overflow: "hidden" },
  watchlistHeading: { minHeight: 44, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.sm },
  watchlistTitle: { ...typography.heading, color: colors.textPrimary },
  watchlistMeta: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  textAction: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.xs, marginTop: -8 },
  textActionLabel: { ...typography.label, color: colors.teal },
  stockList: { overflow: "hidden" },
  askSection: { marginTop: spacing.md },
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
