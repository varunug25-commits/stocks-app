import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { EventCard } from "@/components/finance/EventCard";
import { IconButton } from "@/components/foundation/IconButton";
import { ProductHeader } from "@/components/foundation/ProductHeader";
import { Screen } from "@/components/foundation/Screen";
import { SectionHeader } from "@/components/foundation/SectionHeader";
import { MaterialChangeRow } from "@/components/materiality/MaterialChangeRow";
import { EmptyState } from "@/components/system/EmptyState";
import { SkeletonState } from "@/components/system/SkeletonState";
import { useMarketData } from "@/features/market-data/MarketDataProvider";
import { calculateWatchlistBreadth, deriveWatchlistPatterns, useChangeDetection } from "@/features/materiality";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { colors, numerals, spacing, typography } from "@/theme/tokens";

export default function PulseScreen() {
  const router = useRouter();
  const { state: watchlist, hydrated } = useWatchlist();
  const { quotes, companies, events, loadCompany } = useMarketData();
  const changes = useChangeDetection();
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (hydrated) void Promise.all(watchlist.symbols.map(loadCompany));
  }, [hydrated, loadCompany, watchlist.symbols]);

  const quoteValues = useMemo(() => Object.fromEntries(watchlist.symbols.map((symbol) => {
    const resource = quotes[symbol];
    return [symbol, resource?.status === "ready" || resource?.status === "stale" ? resource.data : null];
  })), [quotes, watchlist.symbols]);
  const companyValues = useMemo(() => Object.fromEntries(watchlist.symbols.map((symbol) => {
    const resource = companies[symbol];
    return [symbol, resource?.status === "ready" || resource?.status === "stale" ? resource.data : null];
  })), [companies, watchlist.symbols]);
  const eventValues = useMemo(() => watchlist.symbols.flatMap((symbol) => {
    const resource = events[symbol];
    return resource?.status === "ready" || resource?.status === "stale" ? resource.data : [];
  }), [events, watchlist.symbols]);
  const breadth = useMemo(() => calculateWatchlistBreadth(watchlist.symbols, quoteValues), [quoteValues, watchlist.symbols]);
  const patterns = useMemo(() => deriveWatchlistPatterns({ symbols: watchlist.symbols, quotes: quoteValues, companies: companyValues, changes: changes.result?.materialChanges ?? [], events: eventValues, now }), [changes.result?.materialChanges, companyValues, eventValues, now, quoteValues, watchlist.symbols]);
  const unusual = (changes.result?.materialChanges ?? []).filter((change) => change.moveLabel === "UNUSUAL MOVE" || change.moveLabel === "ELEVATED MOVE");
  const upcoming = eventValues.filter((event) => event.scheduledAt && Date.parse(event.scheduledAt) >= now).sort((left, right) => Date.parse(left.scheduledAt!) - Date.parse(right.scheduledAt!)).slice(0, 5);

  const refresh = async () => {
    setRefreshing(true);
    try { await changes.refresh(); setNow(Date.now()); } finally { setRefreshing(false); }
  };
  const openChange = (id: string, symbol: string) => { void changes.markSeen([id]); router.push(`/stock/${symbol}/why` as Href); };

  if (!hydrated || changes.loading) return <Screen><SkeletonState /></Screen>;
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl onRefresh={() => void refresh()} refreshing={refreshing} tintColor={colors.textPrimary} />} showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <ProductHeader actions={<IconButton accessibilityLabel="Search stocks" icon="search" onPress={() => router.push("/search" as Href)} />} eyebrow="WATCHLIST INTELLIGENCE" subtitle="Patterns and developments within the companies you follow." title="Pulse" />
          {!watchlist.symbols.length ? <View style={styles.section}><EmptyState actionLabel="Search stocks" description="Pulse summarizes unusual moves, shared developments and known events across your list." onAction={() => router.push("/search" as Href)} title="Follow a few companies" /></View> : <>
            <View style={styles.section}>
              <SectionHeader eyebrow={`${watchlist.symbols.length} WATCHED STOCKS · 1D`} title="Today’s watchlist" />
              <View accessibilityLabel={`${breadth.higher} higher, ${breadth.lower} lower, ${breadth.unchanged} unchanged`} style={styles.breadth}>
                <BreadthStat label="Higher" tone={colors.positive} value={breadth.higher} />
                <BreadthStat label="Lower" tone={colors.negative} value={breadth.lower} />
                <BreadthStat label="Unchanged" tone={colors.textSecondary} value={breadth.unchanged} />
              </View>
              {breadth.unavailable ? <Text style={styles.unavailable}>{breadth.unavailable} {breadth.unavailable === 1 ? "quote is" : "quotes are"} unavailable.</Text> : null}
            </View>

            <View style={styles.section}>
              <SectionHeader eyebrow="PRICE CONTEXT" title={`${unusual.length} ${unusual.length === 1 ? "unusual move" : "unusual moves"}`} />
              {unusual.length ? <View style={styles.list}>{unusual.map((change, index) => <MaterialChangeRow change={change} index={index} key={change.id} onPress={() => openChange(change.id, change.symbol)} />)}</View> : <EmptyState description="No supported watchlist move is elevated versus its recent typical daily range." title="Moves remain within range" />}
            </View>

            <View style={styles.section}>
              <SectionHeader eyebrow="DETERMINISTIC · WITHIN YOUR WATCHLIST" title="Patterns" />
              {patterns.length ? <View style={styles.list}>{patterns.map((pattern) => <View key={pattern.id} style={styles.pattern}><View style={[styles.patternIcon, pattern.tone === "attention" && styles.patternAttention]}><Ionicons color={pattern.tone === "attention" ? colors.warning : colors.textSecondary} name={pattern.tone === "attention" ? "pulse-outline" : "remove-outline"} size={18} /></View><View style={styles.patternCopy}><Text style={styles.patternTitle}>{pattern.title}</Text><Text style={styles.patternDetail}>{pattern.detail}</Text></View></View>)}</View> : <EmptyState description="No supported cross-watchlist pattern is strong enough to surface." title="No clear pattern" />}
            </View>

            <View style={styles.section}>
              <SectionHeader eyebrow="KNOWN DATES" title="Next seven days" />
              {upcoming.length ? upcoming.map((event) => { const date = new Date(event.scheduledAt!); return <EventCard event={{ id: event.id, day: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(), date: String(date.getDate()), time: event.timing === "unknown" ? "Time unavailable" : event.timing.replace("-", " "), title: event.title, detail: event.source, symbol: event.symbol ?? undefined, tone: "earnings" }} key={event.id} />; }) : <EmptyState description="No provider-backed company events are currently available for this period." title="No known events" />}
            </View>
          </>}
          <View style={styles.disclosure}><Ionicons color={colors.textTertiary} name="information-circle-outline" size={17} /><Text style={styles.disclosureText}>Pulse describes only supported evidence within your watchlist. It does not claim sector-wide or market-wide causation.</Text></View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function BreadthStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <View style={styles.stat}><Text style={[styles.statValue, { color: tone }]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 112, backgroundColor: colors.background },
  column: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg },
  section: { marginTop: spacing.xl },
  breadth: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  stat: { flex: 1, minHeight: 72, justifyContent: "center", paddingVertical: spacing.sm },
  statValue: { ...numerals, ...typography.title },
  statLabel: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  unavailable: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs },
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  pattern: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  patternIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: colors.surface },
  patternAttention: { backgroundColor: "#2A2114" },
  patternCopy: { flex: 1 },
  patternTitle: { ...typography.label, color: colors.textPrimary },
  patternDetail: { ...typography.caption, color: colors.textSecondary, marginTop: 3 },
  disclosure: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.xxl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  disclosureText: { ...typography.caption, flex: 1, color: colors.textTertiary },
});
