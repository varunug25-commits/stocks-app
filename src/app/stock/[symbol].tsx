import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CatalystCard } from "@/components/stock/CatalystCard";
import { ChartRangeSelector } from "@/components/stock/ChartRangeSelector";
import { DataFreshnessBadge } from "@/components/stock/DataFreshnessBadge";
import { FilingRow } from "@/components/stock/FilingRow";
import { MarketStatsGrid } from "@/components/stock/MarketStatsGrid";
import { PriceChart } from "@/components/stock/PriceChart";
import { PriceMovement } from "@/components/stock/PriceMovement";
import { SourceList } from "@/components/stock/SourceList";
import { StockHeader } from "@/components/stock/StockHeader";
import { StoryRow } from "@/components/stock/StoryRow";
import { WhyItMovedCard } from "@/components/stock/WhyItMovedCard";
import { OfflineBanner } from "@/components/foundation/Feedback";
import { Screen } from "@/components/foundation/Screen";
import { SectionHeader } from "@/components/foundation/SectionHeader";
import { EmptyState } from "@/components/system/EmptyState";
import { SkeletonState } from "@/components/system/SkeletonState";
import {
  catalysts,
  companyBySymbol,
  filings,
  formatPrice,
  getChartSeries,
  insights,
  isStockSymbol,
  prices,
  sourceMetadata,
  statistics,
  stockStories,
} from "@/data/stocks";
import type { ChartRange } from "@/data/stocks";
import { WATCHLIST_LIMIT } from "@/features/watchlist/model";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function StockDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ symbol?: string; preview?: string }>();
  const { state, dispatch } = useWatchlist();
  if (!isStockSymbol(params.symbol))
    return (
      <Screen>
        <View style={styles.center}>
          <EmptyState
            description="This company is not in the local demo catalog."
            title="Stock unavailable"
          />
        </View>
      </Screen>
    );
  const symbol = params.symbol;
  const company = companyBySymbol[symbol];
  const price = prices[symbol];
  const insight = insights[symbol];
  const range = state.selectedRanges[symbol] ?? "1D";
  const added = state.symbols.includes(symbol);
  const toggle = () =>
    added
      ? dispatch({ type: "remove", symbol })
      : state.symbols.length < WATCHLIST_LIMIT &&
        dispatch({ type: "add", symbol });
  if (params.preview === "loading")
    return (
      <Screen>
        <SkeletonState />
      </Screen>
    );
  const summary = `${company.name} ${range} chart. ${price.change >= 0 ? "Gain" : "Loss"} of ${Math.abs(price.changePercent).toFixed(2)} percent. Selected range ends at ${formatPrice(price.price)}.`;
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
          <PriceMovement
            change={price.change}
            percent={price.changePercent}
            price={formatPrice(price.price)}
          />
          <View style={styles.metaRow}>
            <View style={styles.status}>
              <View style={styles.dot} />
              <Text style={styles.statusText}>{price.status}</Text>
            </View>
            <DataFreshnessBadge />
          </View>
          <Text style={styles.updated}>{price.updated}</Text>
        </View>
        <View style={styles.chartCard}>
          <PriceChart
            points={getChartSeries(symbol, range, price.price)}
            positive={price.change >= 0}
            summary={summary}
            unavailable={params.preview === "chart-unavailable"}
          />
          <ChartRangeSelector
            onChange={(next: ChartRange) =>
              dispatch({ type: "range", symbol, range: next })
            }
            value={range}
          />
        </View>
        <View style={styles.section}>
          <WhyItMovedCard
            insight={insight}
            onPress={() => router.push(`/stock/${symbol}/why` as Href)}
          />
        </View>
        <View style={styles.section}>
          <SectionHeader
            eyebrow="WHAT MATTERS NEXT"
            title="Catalysts and scenarios"
          />
          <View style={styles.stack}>
            {catalysts[symbol].map((item) => (
              <CatalystCard item={item} key={item.id} />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <SectionHeader eyebrow="SUPPORTING EVIDENCE" title="Key statistics" />
          <MarketStatsGrid items={statistics[symbol]} />
        </View>
        <View style={styles.section}>
          <SectionHeader title="Latest filings" />
          <View style={styles.list}>
            {filings[symbol].map((item) => (
              <FilingRow item={item} key={item.id} />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <SectionHeader title="Latest stories" />
          <View style={styles.list}>
            {stockStories[symbol].map((item) => (
              <StoryRow item={item} key={item.id} />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <SectionHeader title="Sources" />
          <View style={styles.list}>
            <SourceList
              items={[
                sourceMetadata.sec,
                sourceMetadata.editorial,
                sourceMetadata.market,
              ]}
            />
          </View>
        </View>
        <View style={styles.disclaimer}>
          <Ionicons
            color={colors.textTertiary}
            name="shield-checkmark-outline"
            size={18}
          />
          <Text style={styles.disclaimerText}>
            Illustrative local data for informational purposes only. Not
            investment advice. No live market connection.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
const styles = StyleSheet.create({
  scroll: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg },
  priceBlock: { marginTop: spacing.xl },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
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
    backgroundColor: colors.positive,
  },
  statusText: { ...typography.label, color: colors.textSecondary },
  updated: { ...typography.caption, color: colors.textTertiary },
  chartCard: {
    padding: spacing.md,
    marginTop: spacing.lg,
    borderRadius: radii.hero,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: { gap: spacing.sm, marginTop: spacing.xxxl },
  stack: { gap: spacing.sm },
  list: {
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  disclaimer: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xxxl,
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
