import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DemoDataBadge, OfflineBanner } from "@/components/foundation/Feedback";
import { Screen } from "@/components/foundation/Screen";
import { SearchField } from "@/components/search/SearchField";
import { SearchResultRow } from "@/components/search/SearchResultRow";
import { EmptyState } from "@/components/system/EmptyState";
import { WatchlistLimitSheet } from "@/components/stock/WatchlistLimitSheet";
import {
  findStock,
  searchableStocks,
  searchLocalStocks,
  trendingStocks,
} from "@/data/search";
import { isStockSymbol } from "@/data/stocks";
import type { StockSymbol } from "@/data/stocks";
import { WATCHLIST_LIMIT } from "@/features/watchlist/model";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; preview?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [limit, setLimit] = useState(false);
  const { state, dispatch } = useWatchlist();
  const results = useMemo(() => searchLocalStocks(query), [query]);
  const offline = params.preview === "offline";
  const open = (symbol: string) => {
    if (!isStockSymbol(symbol)) return;
    dispatch({ type: "recent", symbol });
    router.push(`/stock/${symbol}` as Href);
  };
  const add = (symbol: string) => {
    if (!isStockSymbol(symbol)) return;
    if (
      state.symbols.length >= WATCHLIST_LIMIT &&
      !state.symbols.includes(symbol)
    ) {
      setLimit(true);
      return;
    }
    dispatch({ type: "add", symbol });
  };
  return (
    <Screen>
      {offline ? <OfflineBanner /> : null}
      <View style={s.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={s.back}
        >
          <Ionicons color={colors.textPrimary} name="arrow-back" size={22} />
        </Pressable>
        <Text style={s.headerTitle}>Find a stock</Text>
        <DemoDataBadge />
      </View>
      <View style={s.search}>
        <SearchField
          autoFocus={!params.q && !offline}
          onChangeText={setQuery}
          value={query}
        />
      </View>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {offline ? (
          <EmptyState
            description="Your recent searches and watchlist remain safely stored on this device."
            title="Search is offline"
          />
        ) : query ? (
          <>
            <View style={s.resultMeta}>
              <Text style={s.sectionTitle}>Results</Text>
              <Text style={s.count}>{results.length} matches</Text>
            </View>
            {results.length ? (
              <View style={s.results}>
                {results.map((stock) => (
                  <SearchResultRow
                    added={
                      isStockSymbol(stock.symbol) &&
                      state.symbols.includes(stock.symbol)
                    }
                    key={stock.symbol}
                    onAdd={() => add(stock.symbol)}
                    onPress={() => open(stock.symbol)}
                    stock={stock}
                    watchlistFull={
                      state.symbols.length >= WATCHLIST_LIMIT &&
                      !state.symbols.includes(stock.symbol as StockSymbol)
                    }
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                actionLabel="Clear search"
                description={`No local companies match “${query}”. Try AAPL or Apple.`}
                onAction={() => setQuery("")}
                title="No results"
              />
            )}
          </>
        ) : (
          <>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>Recent searches</Text>
              {state.recentSearches.length ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => dispatch({ type: "clearRecent" })}
                  style={s.clear}
                >
                  <Text style={s.clearText}>Clear</Text>
                </Pressable>
              ) : null}
            </View>
            {state.recentSearches.length ? (
              <ChipSection onPress={open} symbols={state.recentSearches} />
            ) : (
              <Text style={s.emptyRecent}>
                Stocks you open will appear here.
              </Text>
            )}
            <Text style={[s.sectionTitle, { marginTop: spacing.xxl }]}>
              Trending now
            </Text>
            <ChipSection
              onPress={open}
              symbols={trendingStocks.filter(isStockSymbol)}
            />
            <Text style={[s.sectionTitle, { marginTop: spacing.xxl }]}>
              Explore companies
            </Text>
            <View style={s.results}>
              {searchableStocks.slice(0, 6).map((stock) => (
                <SearchResultRow
                  added={
                    isStockSymbol(stock.symbol) &&
                    state.symbols.includes(stock.symbol)
                  }
                  key={stock.symbol}
                  onAdd={() => add(stock.symbol)}
                  onPress={() => open(stock.symbol)}
                  stock={stock}
                  watchlistFull={
                    state.symbols.length >= WATCHLIST_LIMIT &&
                    !state.symbols.includes(stock.symbol as StockSymbol)
                  }
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <WatchlistLimitSheet onClose={() => setLimit(false)} visible={limit} />
    </Screen>
  );
}
function ChipSection({
  symbols,
  onPress,
}: {
  symbols: StockSymbol[];
  onPress: (symbol: StockSymbol) => void;
}) {
  return (
    <View style={s.chips}>
      {symbols.map((symbol) => {
        const stock = findStock(symbol);
        return (
          <Pressable
            accessibilityLabel={`Open ${stock?.name ?? symbol}`}
            accessibilityRole="button"
            key={symbol}
            onPress={() => onPress(symbol)}
            style={s.chip}
          >
            <Text style={s.chipSymbol}>{symbol}</Text>
            <Text style={s.chipName}>{stock?.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const s = StyleSheet.create({
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -spacing.sm,
  },
  headerTitle: { ...typography.heading, flex: 1, color: colors.textPrimary },
  search: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  scroll: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  resultMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { ...typography.heading, color: colors.textPrimary },
  count: { ...typography.caption, color: colors.textTertiary },
  clear: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  clearText: { ...typography.label, color: colors.teal },
  emptyRecent: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  results: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  chip: {
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSymbol: { ...typography.label, color: colors.teal },
  chipName: { ...typography.caption, color: colors.textTertiary },
});
