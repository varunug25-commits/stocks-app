import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { DemoDataBadge, OfflineBanner } from "@/components/foundation/Feedback";
import { Screen } from "@/components/foundation/Screen";
import { SearchField } from "@/components/search/SearchField";
import { SearchResultRow } from "@/components/search/SearchResultRow";
import { AppBottomSheet } from "@/components/system/AppBottomSheet";
import { EmptyState } from "@/components/system/EmptyState";
import { findStock, recentSearches, searchableStocks, searchLocalStocks, trendingStocks } from "@/data/search";
import type { SearchStock } from "@/data/search";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; preview?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [selected, setSelected] = useState<SearchStock | null>(null);
  const results = useMemo(() => searchLocalStocks(query), [query]);
  const offline = params.preview === "offline";
  const chooseChip = (symbol: string) => setQuery(symbol);

  return <Screen>{offline ? <OfflineBanner /> : null}<View style={styles.header}><Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Ionicons color={colors.textPrimary} name="arrow-back" size={22} /></Pressable><Text style={styles.headerTitle}>Search</Text><DemoDataBadge /></View><View style={styles.searchWrap}><SearchField autoFocus={!params.q && !offline} onChangeText={setQuery} value={query} /></View><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{offline ? <EmptyState description="Search uses local demo data, but this preview shows how an offline interruption will be explained." title="Search is temporarily offline" /> : query ? <View><View style={styles.resultMeta}><Text style={styles.sectionTitle}>Results</Text><Text style={styles.count}>{results.length} matches</Text></View>{results.length ? <View style={styles.results}>{results.map(stock => <SearchResultRow key={stock.symbol} onPress={() => setSelected(stock)} stock={stock} />)}</View> : <EmptyState actionLabel="Clear search" description={`No local demo companies match “${query}”. Try a symbol such as AAPL.`} onAction={() => setQuery("")} title="No matches found" />}</View> : <><ChipSection label="Recent searches" onPress={chooseChip} symbols={recentSearches} /><ChipSection label="Trending now" onPress={chooseChip} symbols={trendingStocks} /><View style={styles.all}><Text style={styles.sectionTitle}>Explore companies</Text><View style={styles.results}>{searchableStocks.slice(0, 5).map(stock => <SearchResultRow key={stock.symbol} onPress={() => setSelected(stock)} stock={stock} />)}</View></View></>}</ScrollView><AppBottomSheet onClose={() => setSelected(null)} title={selected ? `${selected.name} · ${selected.symbol}` : "Stock preview"} visible={Boolean(selected)}><Text style={styles.previewPrice}>{selected?.price}</Text><Text style={[styles.previewChange, { color: (selected?.changePercent ?? 0) >= 0 ? colors.positive : colors.negative }]}>{selected && selected.changePercent >= 0 ? "+" : ""}{selected?.changePercent.toFixed(2)}% today</Text><Text style={styles.previewBody}>This is a lightweight local preview. Full charts, company context and stock details arrive in Milestone 3.</Text></AppBottomSheet></Screen>;
}

function ChipSection({ label, symbols, onPress }: { label: string; symbols: string[]; onPress: (symbol: string) => void }) { return <View style={styles.chipSection}><Text style={styles.sectionTitle}>{label}</Text><View style={styles.chips}>{symbols.map(symbol => { const stock = findStock(symbol); return <Pressable accessibilityRole="button" key={symbol} onPress={() => onPress(symbol)} style={styles.chip}><Text style={styles.chipSymbol}>{symbol}</Text><Text style={styles.chipName}>{stock?.name}</Text></Pressable>; })}</View></View>; }

const styles = StyleSheet.create({
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg }, back: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: -spacing.sm }, headerTitle: { ...typography.heading, flex: 1, color: colors.textPrimary }, searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm }, scroll: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, paddingBottom: spacing.xxxl }, resultMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm }, sectionTitle: { ...typography.heading, color: colors.textPrimary }, count: { ...typography.caption, color: colors.textTertiary }, results: { paddingHorizontal: spacing.md, marginTop: spacing.sm, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }, chipSection: { marginBottom: spacing.xxl }, chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm }, chip: { minHeight: 52, justifyContent: "center", paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, chipSymbol: { ...typography.label, color: colors.teal }, chipName: { ...typography.caption, color: colors.textTertiary }, all: { marginTop: spacing.xs }, previewPrice: { ...typography.display, color: colors.textPrimary }, previewChange: { ...typography.label, marginTop: spacing.xs }, previewBody: { ...typography.body, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.xl },
});
