import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MarketIndexCard } from "@/components/finance/MarketIndexCard";
import { EventCard } from "@/components/finance/EventCard";
import { StoryCard } from "@/components/finance/StoryCard";
import { EmptyState } from "@/components/system/EmptyState";
import { DemoDataBadge } from "@/components/foundation/Feedback";
import { IconButton } from "@/components/foundation/IconButton";
import { ProductHeader } from "@/components/foundation/ProductHeader";
import { Screen } from "@/components/foundation/Screen";
import { SectionHeader } from "@/components/foundation/SectionHeader";
import { EarningsEventCard } from "@/components/market/EarningsEventCard";
import { EconomicEventCard } from "@/components/market/EconomicEventCard";
import { FilterChip } from "@/components/market/FilterChip";
import { MarketMoverRow } from "@/components/market/MarketMoverRow";
import { MarketStatusBadge } from "@/components/market/MarketStatusBadge";
import { ResourceStateNotice } from "@/components/market/ResourceStateNotice";
import { SectorPerformanceCard } from "@/components/market/SectorPerformanceCard";
import { AppBottomSheet } from "@/components/system/AppBottomSheet";
import { earningsEvents, economicEvents, marketIndices, marketStatus, mostActive, sectors, topGainers, topLosers } from "@/data/markets";
import { isStockSymbol } from "@/data/stocks";
import { useMarketData } from "@/features/market-data/MarketDataProvider";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { colors, spacing, typography } from "@/theme/tokens";

type Filter = "Overview" | "Gainers" | "Losers" | "Active";

export default function MarketsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("Overview");
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const { state: watchlistState, hydrated } = useWatchlist();
  const { mode, quotes, companies, news, events, loadQuotes, loadCompany, loadNews, loadEvents } = useMarketData();
  const demoMovers = useMemo(
    () => filter === "Gainers" ? topGainers : filter === "Losers" ? topLosers : mostActive,
    [filter],
  );
  const demoMoverSymbols = useMemo(
    () => [...new Set([...topGainers, ...topLosers, ...mostActive].map((item) => item.symbol))].filter(isStockSymbol),
    [],
  );
  const moverSymbols = useMemo(() => mode === "REAL" ? watchlistState.symbols : demoMoverSymbols, [demoMoverSymbols, mode, watchlistState.symbols]);
  useEffect(() => {
    if (!hydrated) return;
    void loadQuotes(moverSymbols);
    if (mode === "REAL") void Promise.all(moverSymbols.flatMap((symbol) => [loadCompany(symbol), loadNews(symbol), loadEvents(symbol)]));
  }, [hydrated, loadCompany, loadEvents, loadNews, loadQuotes, mode, moverSymbols]);
  const realMovers = useMemo(() => watchlistState.symbols.map((symbol) => {
    const resource = companies[symbol];
    const company = resource?.status === "ready" || resource?.status === "stale" ? resource.data : null;
    return { symbol, name: company?.name ?? symbol, price: "", changePercent: 0, volume: "", logoColor: colors.surfaceElevated, trend: [] };
  }).sort((left, right) => {
    const leftQuote = quotes[left.symbol]; const rightQuote = quotes[right.symbol];
    const leftMove = leftQuote?.status === "ready" || leftQuote?.status === "stale" ? Math.abs(leftQuote.data.changePercent ?? 0) : -1;
    const rightMove = rightQuote?.status === "ready" || rightQuote?.status === "stale" ? Math.abs(rightQuote.data.changePercent ?? 0) : -1;
    return rightMove - leftMove;
  }), [companies, quotes, watchlistState.symbols]);
  const realNews = useMemo(() => watchlistState.symbols.flatMap((symbol) => { const resource = news[symbol]; return resource?.status === "ready" || resource?.status === "stale" ? resource.data : []; }).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 5), [news, watchlistState.symbols]);
  const realEvents = useMemo(() => watchlistState.symbols.flatMap((symbol) => { const resource = events[symbol]; return resource?.status === "ready" || resource?.status === "stale" ? resource.data : []; }).filter((event) => event.scheduledAt).sort((a, b) => Date.parse(a.scheduledAt!) - Date.parse(b.scheduledAt!)).slice(0, 5), [events, watchlistState.symbols]);
  const choose = (next: Filter) => { void Haptics.selectionAsync(); setFilter(next); };
  const status = mode === "REAL"
    ? { ...marketStatus, state: "closed" as const, label: "Index status unavailable", detail: "No licensed index-status feed connected", updated: "Unavailable" }
    : marketStatus;
  const moversSection = (
    <View style={styles.section}>
      <SectionHeader eyebrow={mode === "REAL" ? "PROVIDER EQUITY QUOTES · 1D" : "DEMO DATA · 1D"} title="Top movers" />
      <ResourceStateNotice onRetry={() => void loadQuotes(moverSymbols)} resource={moverSymbols[0] ? quotes[moverSymbols[0]] : undefined} />
      <ScrollView contentContainerStyle={styles.chips} horizontal showsHorizontalScrollIndicator={false}>
        {(["Overview", "Gainers", "Losers", "Active"] as Filter[]).map((item) => <FilterChip key={item} label={item} onPress={() => choose(item)} selected={filter === item} />)}
      </ScrollView>
      <View style={styles.list}>{(mode === "REAL" ? realMovers : demoMovers).map((mover) => <MarketMoverRow key={mover.symbol} mover={mover} onPress={() => router.push(`/stock/${mover.symbol}` as Href)} quote={isStockSymbol(mover.symbol) ? quotes[mover.symbol] : undefined} />)}</View>
      {mode === "REAL" && !realMovers.length ? <EmptyState actionLabel="Search stocks" description="Add companies to compare their supported daily moves." onAction={() => router.push("/search" as Href)} title="No watchlist movers yet" /> : null}
    </View>
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <ProductHeader
            actions={<IconButton accessibilityLabel="Search markets" icon="search" onPress={() => router.push("/search" as Href)} />}
            eyebrow={mode === "REAL" ? "SUPPORTED EQUITIES" : "MARKET OVERVIEW"}
            subtitle={mode === "REAL" ? "Provider-backed equity prices lead; market-wide context remains secondary." : "Illustrative market layout with clearly labeled demo data."}
            title="Markets"
          />

          {mode === "DEMO" ? <View style={styles.statusLine}>
            <MarketStatusBadge status={status} />
            <DemoDataBadge />
          </View> : null}

          {mode === "REAL" ? moversSection : null}

          {mode === "DEMO" ? <View style={styles.section}>
            <SectionHeader eyebrow="DEMO DATA · 1D" title="Major indices" />
            <ScrollView contentContainerStyle={styles.horizontal} horizontal showsHorizontalScrollIndicator={false}>
              {marketIndices.map((index) => (
                <Pressable accessibilityRole="button" key={index.id} onPress={() => setDetail({ title: index.name, body: index.summary })}>
                  <MarketIndexCard index={index} />
                </Pressable>
              ))}
            </ScrollView>
          </View> : null}

          {mode === "DEMO" ? <View style={styles.section}>
            <SectionHeader eyebrow="DEMO DATA · 1D" title="Sector performance" />
            <ScrollView contentContainerStyle={styles.horizontal} horizontal showsHorizontalScrollIndicator={false}>
              {sectors.map((sector) => <SectorPerformanceCard key={sector.id} onPress={() => setDetail({ title: sector.name, body: `${sector.leaders} are illustrative leaders for this sector preview.` })} sector={sector} />)}
            </ScrollView>
          </View> : null}

          <View style={styles.coverage}>
            <View style={styles.coverageIcon}><Ionicons color={colors.textSecondary} name="globe-outline" size={18} /></View>
            <View style={styles.coverageCopy}>
              <Text style={styles.coverageTitle}>Commodities & currencies</Text>
              <Text style={styles.coverageMeta}>Unavailable. MarketBrief does not display invented values.</Text>
            </View>
          </View>

          {mode === "DEMO" ? moversSection : null}

          {mode === "REAL" ? <><View style={styles.section}><SectionHeader eyebrow="PROVIDER EVENTS" title="Upcoming company events" />{realEvents.length ? realEvents.map((event) => { const date = new Date(event.scheduledAt!); return <EventCard event={{ id: event.id, day: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(), date: String(date.getDate()), time: event.timing === "unknown" ? "Time unavailable" : event.timing.replace("-", " "), title: event.title, detail: event.source, symbol: event.symbol ?? undefined, tone: "earnings" }} key={event.id} />; }) : <EmptyState description="No supported upcoming events are available." title="No events scheduled" />}</View><View style={styles.section}><SectionHeader eyebrow="PROVIDER NEWS" title="Latest relevant news" />{realNews.length ? realNews.map((story) => <StoryCard key={story.id} onPress={story.sourceUrl ? () => void Linking.openURL(story.sourceUrl) : undefined} story={{ id: story.id, category: story.relatedSymbols[0] ?? "COMPANY", title: story.headline, summary: story.summary ?? "Open the publisher source for the full report.", source: story.publisher, published: new Date(story.publishedAt).toLocaleString(), readTime: "Source", palette: ["#000", "#000"], artwork: "grid" }} />) : <EmptyState description="No supported company news is available." title="No recent news" />}</View></> : null}

          {mode === "DEMO" ? <View style={styles.section}>
            <SectionHeader eyebrow="ILLUSTRATIVE CALENDAR" title="Earnings" />
            <View style={styles.stack}>{earningsEvents.map((event) => <EarningsEventCard event={event} key={event.id} />)}</View>
          </View> : null}
          {mode === "DEMO" ? <View style={styles.section}>
            <SectionHeader eyebrow="ILLUSTRATIVE CALENDAR" title="Economic events" />
            <View style={styles.stack}>{economicEvents.map((event) => <EconomicEventCard event={event} key={event.id} />)}</View>
          </View> : null}

          <View style={styles.disclosure}>
            <Ionicons color={colors.textTertiary} name="information-circle-outline" size={17} />
            <Text style={styles.disclosureText}>{mode === "REAL" ? "This view uses supported watchlist quotes, company news and events. Unsupported market-wide indices and sectors are omitted rather than estimated." : "Illustrative demo data only. Demo mode is explicit and never replaces unavailable provider data."}</Text>
          </View>
        </View>
      </ScrollView>
      <AppBottomSheet onClose={() => setDetail(null)} title={detail?.title ?? "Market detail"} visible={Boolean(detail)}>
        <Text style={styles.sheetBody}>{detail?.body}</Text>
        <Text style={styles.sheetNote}>Illustrative context · educational, not investment advice.</Text>
      </AppBottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 104, backgroundColor: colors.background },
  column: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg },
  statusLine: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  contextHeading: { gap: spacing.xs, marginTop: spacing.xl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  contextCopy: { ...typography.caption, color: colors.textTertiary },
  section: { gap: spacing.xs, marginTop: spacing.xl },
  horizontal: { gap: spacing.xs, paddingRight: spacing.lg },
  chips: { gap: spacing.xs, paddingRight: spacing.lg },
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  stack: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  coverage: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xl, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  coverageIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderRadius: 8 },
  coverageCopy: { flex: 1 },
  coverageTitle: { ...typography.label, color: colors.textPrimary },
  coverageMeta: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  disclosure: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.xxl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  disclosureText: { ...typography.caption, flex: 1, color: colors.textTertiary },
  sheetBody: { ...typography.body, color: colors.textSecondary },
  sheetNote: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.lg, marginBottom: spacing.lg },
});
