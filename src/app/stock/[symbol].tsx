import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CatalystCard } from "@/components/stock/CatalystCard";
import { ChartRangeSelector } from "@/components/stock/ChartRangeSelector";
import { DataFreshnessBadge } from "@/components/stock/DataFreshnessBadge";
import { MarketStatsGrid } from "@/components/stock/MarketStatsGrid";
import { PriceChart } from "@/components/stock/PriceChart";
import { PriceMovement } from "@/components/stock/PriceMovement";
import { SourceList } from "@/components/stock/SourceList";
import { StockHeader } from "@/components/stock/StockHeader";
import { TimelineRow } from "@/components/stock/TimelineRow";
import { ThesisEditor } from "@/components/stock/ThesisEditor";
import { StockGroupEditor } from "@/components/stock/StockGroupEditor";
import { AskMarketBriefEntry, IntelligencePanel } from "@/components/intelligence";
import { WatchlistLimitSheet } from "@/components/stock/WatchlistLimitSheet";
import { OfflineBanner } from "@/components/foundation/Feedback";
import { Screen } from "@/components/foundation/Screen";
import { SectionHeader } from "@/components/foundation/SectionHeader";
import { EmptyState } from "@/components/system/EmptyState";
import { SkeletonState } from "@/components/system/SkeletonState";
import { ResourceStateNotice } from "@/components/market/ResourceStateNotice";
import {
  companyBySymbol,
  formatPrice,
  isStockSymbol,
} from "@/data/stocks";
import type { ChartRange } from "@/data/stocks";
import { formatFreshness, latestFilingsForPresentation, latestNewsForPresentation } from "@/data/real";
import { WATCHLIST_LIMIT } from "@/features/watchlist/model";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { barKey, useMarketData } from "@/features/market-data/MarketDataProvider";
import { colors, radii, spacing, typography } from "@/theme/tokens";
import type { IntelligenceRequest } from "@/data/intelligence";
import { useIntelligenceRequest } from "@/features/intelligence/useIntelligenceRequest";
import { buildStockTimeline, groupStockTimeline } from "@/features/timeline";
import { useTheses } from "@/features/thesis";
import { useGroups } from "@/features/groups";
import { useTelemetry } from "@/features/telemetry";

export default function StockDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ symbol?: string; preview?: string }>();
  const { state, dispatch } = useWatchlist();
  const theses = useTheses();
  const groups = useGroups();
  const telemetry = useTelemetry();
  const {
    mode, quotes, companies, bars, filings: filingResources, news, events,
    loadStock, loadQuote, loadBars, loadNews, loadFilings, loadEvents,
  } = useMarketData();
  const [limitVisible, setLimitVisible] = useState(false);
  const validSymbol = isStockSymbol(params.symbol) ? params.symbol : null;
  const whyRequest = useMemo<IntelligenceRequest>(() => ({ task: "why_moved", symbols: validSymbol ? [validSymbol] : ["AAPL"], timeWindow: "1D" }), [validSymbol]);
  const { resource: whyResource, retry: retryWhy } = useIntelligenceRequest(whyRequest, !!validSymbol);
  const range = validSymbol ? state.selectedRanges[validSymbol] ?? "1D" : "1D";
  useEffect(() => {
    if (validSymbol) void loadStock(validSymbol);
  }, [loadStock, validSymbol]);
  useEffect(() => {
    if (validSymbol) void loadBars(validSymbol, range);
  }, [loadBars, range, validSymbol]);
  if (!validSymbol)
    return (
      <Screen>
        <View style={styles.center}>
          <EmptyState
            description="Enter a valid supported U.S. equity symbol."
            title="Stock unavailable"
          />
        </View>
      </Screen>
    );
  const symbol = validSymbol;
  const companyResource = companies[symbol];
  const providerCompany = companyResource?.status === "ready" || companyResource?.status === "stale" ? companyResource.data : null;
  const demoCompany = companyBySymbol[symbol];
  const company = providerCompany ?? demoCompany ?? { symbol, name: symbol, exchange: "Validation pending", sector: null, logoColor: null };
  const quoteResource = quotes[symbol];
  const quote = quoteResource?.status === "ready" || quoteResource?.status === "stale" ? quoteResource.data : null;
  const barResource = bars[barKey(symbol, range)];
  const barData = barResource?.status === "ready" || barResource?.status === "stale" ? barResource.data : [];
  const chartPoints = barData.map((bar) => ({ label: new Date(bar.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: bar.close }));
  const filingResource = filingResources[symbol];
  const filingData = filingResource?.status === "ready" || filingResource?.status === "stale" ? filingResource.data : null;
  const latestFilings = filingData ? latestFilingsForPresentation(filingData) : null;
  const newsResource = news[symbol];
  const newsData = newsResource?.status === "ready" || newsResource?.status === "stale" ? newsResource.data : null;
  const latestNews = newsData ? latestNewsForPresentation(newsData) : null;
  const eventResource = events[symbol];
  const eventData = eventResource?.status === "ready" || eventResource?.status === "stale" ? eventResource.data : null;
  const timeline = buildStockTimeline({ symbol, quote, quoteMeta: quoteResource?.status === "ready" || quoteResource?.status === "stale" ? quoteResource.meta : undefined, news: latestNews ?? [], filings: latestFilings ?? [], events: eventData ?? [] });
  const timelineGroups = groupStockTimeline(timeline);
  const statistics = quote ? [
    { label: "Previous close", value: quote.previousClose === null ? "Unknown" : formatPrice(quote.previousClose) },
    { label: "Open", value: quote.open === null ? "Unknown" : formatPrice(quote.open) },
    { label: "High", value: quote.high === null ? "Unknown" : formatPrice(quote.high) },
    { label: "Low", value: quote.low === null ? "Unknown" : formatPrice(quote.low) },
    { label: "Volume", value: quote.volume === null ? "Unknown" : quote.volume.toLocaleString("en-US") },
    { label: "Currency", value: quote.currency ?? "Unknown" },
  ] : [];
  const added = state.symbols.includes(symbol);
  const toggle = () => {
    if (added) { telemetry.track("stock_removed", { symbol }); return dispatch({ type: "remove", symbol }); }
    if (state.symbols.length >= WATCHLIST_LIMIT)
      return setLimitVisible(true);
    dispatch({ type: "add", symbol });
    telemetry.track("stock_added", { symbol });
  };
  if (params.preview === "loading")
    return (
      <Screen>
        <SkeletonState variant="stock" />
      </Screen>
    );
  const summary = quote && quote.changePercent !== null
    ? `${company.name} ${range} chart. ${quote.changePercent >= 0 ? "Gain" : "Loss"} of ${Math.abs(quote.changePercent).toFixed(2)} percent. Selected range ends at ${formatPrice(quote.price)}.`
    : `${company.name} ${range} chart data is unavailable.`;
  const sources = [quoteResource, barResource, filingResource, newsResource, eventResource].flatMap((resource, index) =>
    resource?.status === "ready" || resource?.status === "stale"
      ? [{ id: `${resource.meta.provider}-${index}`, name: resource.meta.source, kind: resource.meta.provider, timestamp: formatFreshness(resource.meta) }]
      : [],
  );
  return (
    <Screen>
      {params.preview === "offline" ? <OfflineBanner /> : null}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <StockHeader
          added={added}
          company={company}
          onBack={() => router.back()}
          onToggle={toggle}
        />
        <View style={styles.priceBlock}>
          <ResourceStateNotice onRetry={() => void loadQuote(symbol)} resource={quoteResource} />
          {quote ? <>{quote.change !== null && quote.changePercent !== null ? <PriceMovement change={quote.change} percent={quote.changePercent} price={formatPrice(quote.price)} /> : <View><Text style={styles.standalonePrice}>{formatPrice(quote.price)}</Text><Text style={styles.updated}>Daily change unavailable from provider</Text></View>}<View style={styles.metaRow}><View style={styles.status}><View style={[styles.dot, quote.marketStatus !== "open" && styles.dotMuted]} /><Text style={styles.statusText}>Market {quote.marketStatus}</Text></View><DataFreshnessBadge label={quoteResource?.status === "stale" ? "STALE" : mode === "REAL" ? "PROVIDER DATA" : "DEMO · ILLUSTRATIVE"} /></View></> : null}
        </View>
        <View style={styles.chartCard}>
          <ResourceStateNotice onRetry={() => void loadBars(symbol, range)} resource={barResource} />
          <PriceChart
            key={`${symbol}-${range}`}
            points={chartPoints}
            positive={(quote?.change ?? 0) >= 0}
            summary={summary}
            unavailable={params.preview === "chart-unavailable" || !chartPoints.length}
          />
          <ChartRangeSelector
            onChange={(next: ChartRange) =>
              dispatch({ type: "range", symbol, range: next })
            }
            value={range}
          />
        </View>
        <View style={styles.section}>
          <SectionHeader eyebrow="REAL PROVIDER EVIDENCE" title="What changed" />
          <ResourceStateNotice onRetry={() => void loadNews(symbol)} resource={newsResource} />
          <ResourceStateNotice onRetry={() => void loadFilings(symbol)} resource={filingResource} />
          <View style={styles.list}>
            {timelineGroups.map((group) => <View key={group.key}><Text style={styles.timelineDate}>{group.label}</Text>{group.entries.map((item) => <TimelineRow item={item} key={item.id} />)}</View>)}
          </View>
          {!timeline.length && newsResource?.status !== "loading" && filingResource?.status !== "loading" ? <EmptyState description="No timestamped provider evidence is currently available for this company." title="No recent timeline entries" /> : null}
        </View>
        <View style={styles.section}>
          <SectionHeader actionLabel="See evidence" eyebrow="GROUNDED" onAction={() => router.push(`/stock/${symbol}/why` as Href)} title="Why it moved" />
          <IntelligencePanel onRetry={() => void retryWhy()} resource={whyResource} showHeader={false} />
          <AskMarketBriefEntry detail="Use this company’s available evidence" label={`Ask about ${symbol}`} onPress={() => router.push(`/ask?symbol=${symbol}` as Href)} />
        </View>
        <View style={styles.section}>
          <SectionHeader eyebrow="OPTIONAL · SAVED ON THIS DEVICE" title="My thesis" />
          <ThesisEditor onAsk={() => router.push(`/ask?symbol=${symbol}&mode=thesis&prompt=${encodeURIComponent("What changed vs my thesis?")}` as Href)} onSave={async (value) => { await theses.save(symbol, value); telemetry.track("thesis_saved", { symbol, outcome: value.trim() ? "saved" : "removed" }); }} value={theses.state.bySymbol[symbol] ?? ""} />
        </View>
        <View style={styles.section}>
          <SectionHeader eyebrow="LOCAL ORGANIZATION" title="Groups" />
          <StockGroupEditor groups={groups.state.groups} onToggle={(id) => groups.toggleSymbol(id, symbol)} symbol={symbol} />
        </View>
        <View style={styles.section}>
          <SectionHeader
            eyebrow="WHAT MATTERS NEXT"
            title="Company events"
          />
          <ResourceStateNotice onRetry={() => void loadEvents(symbol)} resource={eventResource} />
          <View style={styles.stack}>
            {eventData?.map((item) => <CatalystCard item={{ id: item.id, date: item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString() : "Timing unknown", title: item.title, detail: `${item.source} · ${item.timing}`, tone: "event" }} key={item.id} />)}
          </View>
        </View>
        <View style={styles.section}>
          <SectionHeader eyebrow="PROVIDER FIELDS" title="Session statistics" />
          {statistics.length ? <MarketStatsGrid items={statistics} /> : <EmptyState description="The quote provider did not return session statistics." title="Statistics unavailable" />}
        </View>
        <View style={styles.section}>
          <SectionHeader title="Sources" />
          <View style={styles.list}>
            <SourceList items={sources} />
          </View>
        </View>
        <View style={styles.disclaimer}>
          <Ionicons
            color={colors.textTertiary}
            name="shield-checkmark-outline"
            size={18}
          />
          <Text style={styles.disclaimerText}>
            {mode === "REAL" ? "Provider data may be delayed, stale or unavailable. Grounded summaries identify their supporting evidence and uncertainty." : "Illustrative demo data for informational purposes only. Not investment advice."}
          </Text>
        </View>
      </ScrollView>
      <WatchlistLimitSheet
        onClose={() => setLimitVisible(false)}
        visible={limitVisible}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  scroll: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg },
  priceBlock: { marginTop: spacing.md },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  status: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
  },
  dotMuted: { backgroundColor: colors.textTertiary },
  statusText: { ...typography.label, color: colors.textSecondary },
  updated: { ...typography.caption, color: colors.textTertiary },
  standalonePrice: { ...typography.display, color: colors.textPrimary },
  chartCard: {
    padding: spacing.md,
    marginTop: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: { gap: spacing.xs, marginTop: spacing.xl },
  stack: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    overflow: "hidden",
  },
  timelineDate: { ...typography.caption, color: colors.textSecondary, paddingTop: spacing.md, paddingBottom: spacing.xs, letterSpacing: 0.8 },
  disclaimer: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xxl,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  disclaimerText: {
    ...typography.caption,
    flex: 1,
    color: colors.textTertiary,
  },
});
