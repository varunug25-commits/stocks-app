import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MarketIndexCard } from "@/components/finance/MarketIndexCard";
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
import { colors, spacing, typography } from "@/theme/tokens";

type Filter = "Overview" | "Gainers" | "Losers" | "Active";

export default function MarketsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("Overview");
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const { mode, quotes, loadQuotes } = useMarketData();
  const movers = useMemo(
    () => filter === "Gainers" ? topGainers : filter === "Losers" ? topLosers : mostActive,
    [filter],
  );
  const moverSymbols = useMemo(
    () => [...new Set([...topGainers, ...topLosers, ...mostActive].map((item) => item.symbol))].filter(isStockSymbol),
    [],
  );
  useEffect(() => { void loadQuotes(moverSymbols); }, [loadQuotes, moverSymbols]);
  const choose = (next: Filter) => { void Haptics.selectionAsync(); setFilter(next); };
  const status = mode === "REAL"
    ? { ...marketStatus, state: "closed" as const, label: "Index status unavailable", detail: "No licensed index-status feed connected", updated: "Unavailable" }
    : marketStatus;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <ProductHeader
            actions={<IconButton accessibilityLabel="Search markets" icon="search" onPress={() => router.push("/search" as Href)} />}
            eyebrow="MARKET OVERVIEW"
            subtitle="Indices and sectors are illustrative; supported equity quotes use the backend."
            title="Markets"
          />

          <View style={styles.statusLine}>
            <MarketStatusBadge status={status} />
            {mode === "DEMO" ? <DemoDataBadge /> : null}
          </View>

          <View style={styles.section}>
            <SectionHeader eyebrow="ILLUSTRATIVE · 1D" title="Major indices" />
            <ScrollView contentContainerStyle={styles.horizontal} horizontal showsHorizontalScrollIndicator={false}>
              {marketIndices.map((index) => (
                <Pressable accessibilityRole="button" key={index.id} onPress={() => setDetail({ title: index.name, body: index.summary })}>
                  <MarketIndexCard index={index} />
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader eyebrow="ILLUSTRATIVE · 1D" title="Sector performance" />
            <ScrollView contentContainerStyle={styles.horizontal} horizontal showsHorizontalScrollIndicator={false}>
              {sectors.map((sector) => <SectorPerformanceCard key={sector.id} onPress={() => setDetail({ title: sector.name, body: `${sector.leaders} are the local illustrative leaders for this sector.` })} sector={sector} />)}
            </ScrollView>
          </View>

          <View style={styles.coverage}>
            <View style={styles.coverageIcon}><Ionicons color={colors.textSecondary} name="globe-outline" size={18} /></View>
            <View style={styles.coverageCopy}>
              <Text style={styles.coverageTitle}>Commodities & currencies</Text>
              <Text style={styles.coverageMeta}>No licensed provider is connected, so MarketBrief does not display invented values.</Text>
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader eyebrow={mode === "REAL" ? "BACKEND EQUITY QUOTES · 1D" : "LOCAL DEMO · 1D"} title="Top movers" />
            <ResourceStateNotice onRetry={() => void loadQuotes(moverSymbols)} resource={moverSymbols[0] ? quotes[moverSymbols[0]] : undefined} />
            <ScrollView contentContainerStyle={styles.chips} horizontal showsHorizontalScrollIndicator={false}>
              {(["Overview", "Gainers", "Losers", "Active"] as Filter[]).map((item) => <FilterChip key={item} label={item} onPress={() => choose(item)} selected={filter === item} />)}
            </ScrollView>
            <View style={styles.list}>{movers.map((mover) => <MarketMoverRow key={mover.symbol} mover={mover} onPress={() => router.push(`/stock/${mover.symbol}` as Href)} quote={isStockSymbol(mover.symbol) ? quotes[mover.symbol] : undefined} />)}</View>
          </View>

          <View style={styles.section}>
            <SectionHeader eyebrow="ILLUSTRATIVE CALENDAR" title="Earnings" />
            <View style={styles.stack}>{earningsEvents.map((event) => <EarningsEventCard event={event} key={event.id} />)}</View>
          </View>
          <View style={styles.section}>
            <SectionHeader eyebrow="ILLUSTRATIVE CALENDAR" title="Economic events" />
            <View style={styles.stack}>{economicEvents.map((event) => <EconomicEventCard event={event} key={event.id} />)}</View>
          </View>

          <View style={styles.disclosure}>
            <Ionicons color={colors.textTertiary} name="information-circle-outline" size={17} />
            <Text style={styles.disclosureText}>{mode === "REAL" ? "Supported equity quotes load through MarketBrief’s backend. Indices, sectors and calendars remain illustrative until licensed sources are integrated." : "Illustrative local data only. Demo mode is explicit and never used as a fallback from real data."}</Text>
          </View>
        </View>
      </ScrollView>
      <AppBottomSheet onClose={() => setDetail(null)} title={detail?.title ?? "Market detail"} visible={Boolean(detail)}>
        <Text style={styles.sheetBody}>{detail?.body}</Text>
        <Text style={styles.sheetNote}>Local illustrative context · educational, not investment advice.</Text>
      </AppBottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 104, backgroundColor: colors.background },
  column: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg },
  statusLine: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
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
