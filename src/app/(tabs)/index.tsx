import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";

import { EventCard } from "@/components/finance/EventCard";
import { StockRow } from "@/components/finance/StockRow";
import { ErrorState, OfflineBanner } from "@/components/foundation/Feedback";
import { IconButton } from "@/components/foundation/IconButton";
import { ProductHeader } from "@/components/foundation/ProductHeader";
import { Screen } from "@/components/foundation/Screen";
import { SectionHeader } from "@/components/foundation/SectionHeader";
import { AskMarketBriefEntry, IntelligencePanel } from "@/components/intelligence";
import { MaterialChangeRow } from "@/components/materiality/MaterialChangeRow";
import { EmptyState } from "@/components/system/EmptyState";
import { SkeletonState } from "@/components/system/SkeletonState";
import { generateBrief, latestBriefSeed } from "@/data/briefs";
import type { IntelligenceRequest } from "@/data/intelligence";
import { isStockSymbol } from "@/data/stocks";
import { useIntelligenceRequest } from "@/features/intelligence/useIntelligenceRequest";
import { useMarketData } from "@/features/market-data/MarketDataProvider";
import { useChangeDetection } from "@/features/materiality";
import { selectTodayWatchlist } from "@/features/watchlist/todayStocks";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { colors, spacing, typography } from "@/theme/tokens";

const enter = (delay: number) => FadeInDown.duration(260).delay(delay);

function relativeCheck(value: string | null, now: number) {
  if (!value) return "Baseline in progress";
  const minutes = Math.max(0, Math.floor((now - Date.parse(value)) / 60_000));
  if (minutes < 1) return "Compared with just now";
  if (minutes < 60) return `Compared with ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `Compared with ${hours}h ago` : `Compared with ${new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export default function TodayScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { state: watchlist, hydrated } = useWatchlist();
  const { mode, quotes, companies, events, loadCompany } = useMarketData();
  const changes = useChangeDetection();
  const reduceMotion = useReducedMotion();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [referenceNow, setReferenceNow] = useState(() => Date.now());

  useEffect(() => {
    if (!hydrated) return;
    void Promise.all(watchlist.symbols.slice(0, 5).map(loadCompany));
  }, [hydrated, loadCompany, watchlist.symbols]);

  const demoStocks = useMemo(() => selectTodayWatchlist(watchlist.symbols), [watchlist.symbols]);
  const baselineMovers = useMemo(() => (mode === "REAL" ? watchlist.symbols.map((symbol) => {
    const companyResource = companies[symbol];
    const company = companyResource?.status === "ready" || companyResource?.status === "stale" ? companyResource.data : null;
    return { symbol, name: company?.name ?? symbol, price: "", changePercent: 0, logoColor: colors.surfaceElevated, trend: [] };
  }) : demoStocks).sort((left, right) => {
    const leftQuote = quotes[left.symbol];
    const rightQuote = quotes[right.symbol];
    const leftMove = leftQuote?.status === "ready" || leftQuote?.status === "stale" ? Math.abs(leftQuote.data.changePercent ?? 0) : -1;
    const rightMove = rightQuote?.status === "ready" || rightQuote?.status === "stale" ? Math.abs(rightQuote.data.changePercent ?? 0) : -1;
    return rightMove - leftMove;
  }).slice(0, 3), [companies, demoStocks, mode, quotes, watchlist.symbols]);

  const upcoming = useMemo(() => watchlist.symbols.flatMap((symbol) => {
    const resource = events[symbol];
    return resource?.status === "ready" || resource?.status === "stale" ? resource.data : [];
  }).filter((event) => event.scheduledAt && Date.parse(event.scheduledAt) >= referenceNow - 86_400_000)
    .sort((left, right) => Date.parse(left.scheduledAt!) - Date.parse(right.scheduledAt!)).slice(0, 4), [events, referenceNow, watchlist.symbols]);

  const demoBrief = useMemo(() => mode === "DEMO" ? generateBrief(latestBriefSeed("morning"), watchlist.symbols) : null, [mode, watchlist.symbols]);
  const briefRequest = useMemo<IntelligenceRequest>(() => ({ task: "brief", symbols: watchlist.symbols.length ? watchlist.symbols : ["AAPL"], edition: "morning", timeWindow: "1D" }), [watchlist.symbols]);
  const { resource: briefResource, retry: retryBrief } = useIntelligenceRequest(briefRequest, mode === "REAL" && hydrated && watchlist.symbols.length > 0);
  const animation = (delay: number) => reduceMotion ? undefined : enter(delay);
  const date = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(referenceNow));

  const refresh = async () => {
    setIsRefreshing(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try { await changes.refresh(); } finally { setReferenceNow(Date.now()); setIsRefreshing(false); }
  };

  const openChange = (change: NonNullable<typeof changes.result>["materialChanges"][number]) => {
    void changes.markSeen([change.id]);
    void Haptics.selectionAsync();
    router.push(change.kind === "event" || change.kind === "filing" ? `/stock/${change.symbol}` as Href : `/stock/${change.symbol}/why` as Href);
  };

  if (!hydrated || changes.loading || preview === "loading") return <Screen><SkeletonState /></Screen>;
  if (preview === "error") return <Screen><View style={styles.state}><ErrorState description="Your previous baseline is safe. Try the comparison again." onRetry={() => void refresh()} title="Changes could not be checked" /></View></Screen>;

  const result = changes.result;
  const material = result?.materialChanges ?? [];
  const quietCount = result?.quietSymbols.length ?? 0;

  return (
    <Screen>
      {preview === "offline" ? <OfflineBanner /> : null}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl colors={[colors.textPrimary]} onRefresh={() => void refresh()} progressBackgroundColor={colors.surfaceElevated} refreshing={isRefreshing} tintColor={colors.textPrimary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <Animated.View entering={animation(0)}>
            <ProductHeader actions={<IconButton accessibilityLabel="Search stocks" icon="search" onPress={() => router.push("/search" as Href)} />} eyebrow={date} title="MarketBrief" />
          </Animated.View>

          {!watchlist.symbols.length ? <Animated.View entering={animation(25)} style={styles.section}>
            <EmptyState actionLabel="Search stocks" description="MarketBrief will track what changes and filter out the noise." onAction={() => router.push("/search" as Href)} title="Follow a few companies" />
          </Animated.View> : result?.baselineReady ? <Animated.View entering={animation(25)} style={styles.section}>
            <Text style={styles.eyebrow}>SINCE YOU LAST CHECKED</Text>
            <Text style={styles.heroTitle}>Your baseline is ready</Text>
            <Text style={styles.heroBody}>MarketBrief will compare future developments against this point. Current watchlist movers are shown below.</Text>
            <View style={styles.baselineList}>{baselineMovers.map((stock) => <StockRow key={stock.symbol} onPress={() => router.push(`/stock/${stock.symbol}` as Href)} quote={isStockSymbol(stock.symbol) ? quotes[stock.symbol] : undefined} stock={stock} />)}</View>
          </Animated.View> : <Animated.View entering={animation(25)} style={styles.section}>
            <Text style={styles.eyebrow}>SINCE YOU LAST CHECKED</Text>
            <Text style={styles.heroTitle}>{material.length ? `${material.length} ${material.length === 1 ? "thing matters" : "things matter"}` : "Nothing material changed"}</Text>
            <Text style={styles.heroMeta}>{relativeCheck(changes.lastCheckedAt, referenceNow)}</Text>
            {material.length ? <View style={styles.changeList}>{material.map((change, index) => <MaterialChangeRow change={change} index={index} key={change.id} onPress={() => openChange(change)} />)}</View> : <Text style={styles.heroBody}>No new watchlist development passed your attention threshold.</Text>}
          </Animated.View>}

          {watchlist.symbols.length && !result?.baselineReady ? <Animated.View entering={animation(50)} style={styles.quietRow}>
            <View style={styles.quietCopy}><Text style={styles.quietTitle}>Your other stocks</Text><Text style={styles.quietMeta}>{quietCount ? `Nothing material changed in ${quietCount} of ${watchlist.symbols.length} stocks.` : "Every watched stock with supported data is included above."}</Text></View>
            <Pressable accessibilityRole="button" onPress={() => router.push("/watchlist" as Href)} style={styles.inlineAction}><Text style={styles.inlineActionText}>View all</Text></Pressable>
          </Animated.View> : null}

          <Animated.View entering={animation(70)} style={styles.section}>
            <SectionHeader eyebrow="KNOWN DATES · NEXT 7 DAYS" title="What matters next" />
            {upcoming.length ? upcoming.map((event) => { const scheduled = new Date(event.scheduledAt!); return <EventCard event={{ id: event.id, day: scheduled.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(), date: String(scheduled.getDate()), time: event.timing === "unknown" ? "Time unavailable" : event.timing.replace("-", " "), title: event.title, detail: event.source, symbol: event.symbol ?? undefined, tone: "earnings" }} key={event.id} />; }) : <EmptyState description="No provider-backed events are scheduled for the next seven days." title="No known catalysts" />}
          </Animated.View>

          <Animated.View entering={animation(90)} style={[styles.section, styles.brief]}>
            <SectionHeader eyebrow="CURRENT EDITION" title="Morning brief" />
            {mode === "REAL" ? watchlist.symbols.length ? <IntelligencePanel onRetry={() => void retryBrief()} resource={briefResource} /> : null : <><Text style={styles.briefTitle}>{demoBrief!.headline}</Text>{demoBrief!.developments.slice(0, 4).map((point, index) => <View key={point} style={styles.briefPoint}><Text style={styles.number}>{String(index + 1).padStart(2, "0")}</Text><Text style={styles.briefText}>{point}</Text></View>)}</>}
            <Pressable accessibilityRole="button" onPress={() => router.push(mode === "REAL" ? "/briefs" as Href : `/brief/${demoBrief!.id}` as Href)} style={styles.link}><Text style={styles.linkText}>Open current brief</Text><Ionicons color={colors.textPrimary} name="arrow-forward" size={17} /></Pressable>
          </Animated.View>

          <Animated.View entering={animation(110)} style={styles.ask}>
            <AskMarketBriefEntry detail="Ask from your watchlist changes and available evidence" label="Ask MarketBrief" onPress={() => router.push("/ask?mode=since_last_check&prompt=What%20changed%20since%20I%20last%20checked%3F" as Href)} />
          </Animated.View>

          <View style={styles.disclosure}><Ionicons color={colors.textTertiary} name="shield-checkmark-outline" size={16} /><Text style={styles.disclosureText}>{mode === "REAL" ? "Changes use available provider evidence and your saved comparison baseline. Missing resources remain unavailable." : "Deliberate demo mode with illustrative market content. Informational only."}</Text></View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 112, backgroundColor: colors.background },
  column: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg },
  state: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.lg },
  section: { marginTop: spacing.xl },
  eyebrow: { ...typography.caption, color: colors.textTertiary, letterSpacing: 0.9 },
  heroTitle: { ...typography.display, color: colors.textPrimary, marginTop: spacing.xs },
  heroMeta: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs },
  heroBody: { ...typography.body, color: colors.textSecondary, maxWidth: 520, marginTop: spacing.sm },
  changeList: { marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  baselineList: { marginTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  quietRow: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.lg, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  quietCopy: { flex: 1 },
  quietTitle: { ...typography.label, color: colors.textPrimary },
  quietMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  inlineAction: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.xs },
  inlineActionText: { ...typography.label, color: colors.textPrimary },
  brief: { paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  briefTitle: { ...typography.heading, color: colors.textPrimary, marginTop: spacing.sm },
  briefPoint: { minHeight: 52, flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSoft },
  number: { ...typography.label, width: 26, color: colors.textTertiary },
  briefText: { ...typography.body, flex: 1, color: colors.textSecondary },
  link: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  linkText: { ...typography.label, color: colors.textPrimary },
  ask: { marginTop: spacing.lg },
  disclosure: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs, marginTop: spacing.xxl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  disclosureText: { ...typography.caption, flex: 1, color: colors.textTertiary },
});
