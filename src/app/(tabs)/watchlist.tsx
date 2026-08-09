import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { ConfirmationModal, ErrorState, OfflineBanner } from "@/components/foundation/Feedback";
import { ProductHeader } from "@/components/foundation/ProductHeader";
import { Screen } from "@/components/foundation/Screen";
import { ResourceStateNotice } from "@/components/market/ResourceStateNotice";
import { WatchlistLimitSheet } from "@/components/stock/WatchlistLimitSheet";
import { WatchlistRow } from "@/components/stock/WatchlistRow";
import { EmptyState } from "@/components/system/EmptyState";
import { SkeletonState } from "@/components/system/SkeletonState";
import { companyBySymbol } from "@/data/stocks";
import type { StockSymbol } from "@/data/stocks";
import { watchlist as localWatchlistRows } from "@/data/today";
import { useMarketData } from "@/features/market-data/MarketDataProvider";
import { WATCHLIST_LIMIT } from "@/features/watchlist/model";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { useGroups } from "@/features/groups";
import { colors, spacing, typography } from "@/theme/tokens";

export default function WatchlistScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { state, dispatch, hydrated } = useWatchlist();
  const groups = useGroups();
  const { mode, quotes, companies, loadQuotes, loadCompany } = useMarketData();
  const [editing, setEditing] = useState(false);
  const [remove, setRemove] = useState<StockSymbol | null>(null);
  const [limit, setLimit] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated) {
      void loadQuotes(state.symbols);
      void Promise.all(state.symbols.map(loadCompany));
    }
  }, [hydrated, loadCompany, loadQuotes, state.symbols]);

  const handleRetry = () => {
    setRetrying(true);
    router.replace("/watchlist" as Href);
    setTimeout(() => setRetrying(false), 450);
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    try { await loadQuotes(state.symbols); } finally { setRefreshing(false); }
  };

  if (!hydrated || retrying || preview === "loading") return <Screen><SkeletonState /></Screen>;
  if (preview === "error") {
    return <Screen><View style={styles.center}><ErrorState description="Your stored membership and order remain untouched." onRetry={handleRetry} title="Watchlist needs a refresh" /></View></Screen>;
  }

  const selectedGroup = groups.state.groups.find((group) => group.id === selectedGroupId);
  const symbols = preview === "empty" ? [] : selectedGroup ? state.symbols.filter((symbol) => selectedGroup.symbols.includes(symbol)) : state.symbols;
  const add = () => state.symbols.length >= WATCHLIST_LIMIT ? setLimit(true) : router.push("/search" as Href);

  return (
    <Screen>
      {preview === "offline" ? <OfflineBanner /> : null}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl colors={[colors.teal]} onRefresh={() => void handleRefresh()} progressBackgroundColor={colors.surfaceElevated} refreshing={refreshing} tintColor={colors.teal} />}
        showsVerticalScrollIndicator={false}
      >
        <ProductHeader
          actions={<><Pressable accessibilityLabel="Add stock" accessibilityRole="button" onPress={add} style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}><Ionicons color={colors.teal} name="add" size={20} /><Text style={styles.headerActionText}>Add</Text></Pressable>{symbols.length ? <Pressable accessibilityLabel={editing ? "Finish editing watchlist" : "Edit watchlist"} accessibilityRole="button" onPress={() => setEditing((value) => !value)} style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}><Text style={styles.headerActionText}>{editing ? "Done" : "Edit"}</Text></Pressable> : null}</>}
          eyebrow={`${symbols.length} ${symbols.length === 1 ? "COMPANY" : "COMPANIES"} · SAVED ORDER`}
          subtitle={editing ? "Reorder or remove companies. Changes save automatically." : "Compact prices, daily movement, trend, and source freshness."}
          title="Watchlist"
        />

        {groups.state.groups.length ? <View style={styles.groupArea}><ScrollView contentContainerStyle={styles.groupStrip} horizontal showsHorizontalScrollIndicator={false}><Pressable accessibilityRole="button" onPress={() => setSelectedGroupId(null)} style={[styles.groupChip, !selectedGroup && styles.groupChipSelected]}><Text style={[styles.groupChipText, !selectedGroup && styles.groupChipTextSelected]}>All</Text></Pressable>{groups.state.groups.map((group) => <Pressable accessibilityRole="button" key={group.id} onPress={() => setSelectedGroupId(group.id)} style={[styles.groupChip, selectedGroup?.id === group.id && styles.groupChipSelected]}><Text style={[styles.groupChipText, selectedGroup?.id === group.id && styles.groupChipTextSelected]}>{group.name}</Text></Pressable>)}</ScrollView>{selectedGroup && symbols.length ? <Pressable accessibilityRole="button" onPress={() => router.push(`/ask?symbols=${symbols.join(",")}&mode=watchlist&prompt=${encodeURIComponent(`What changed in my ${selectedGroup.name} group?`)}` as Href)} style={styles.askGroup}><Text style={styles.askGroupText}>Ask about {selectedGroup.name}</Text><Ionicons color={colors.textPrimary} name="arrow-forward" size={16} /></Pressable> : null}</View> : null}

        {symbols[0] ? <ResourceStateNotice onRetry={() => void loadQuotes(symbols)} resource={quotes[symbols[0]]} /> : null}
        {symbols.length ? (
          <View style={styles.list}>
            {symbols.map((symbol) => {
              const resource = companies[symbol];
              const providerCompany = resource?.status === "ready" || resource?.status === "stale" ? resource.data : null;
              const demoCompany = companyBySymbol[symbol];
              const company = providerCompany ?? demoCompany ?? { symbol, name: symbol, logoColor: null };
              return <WatchlistRow
                company={company}
                editing={editing}
                key={symbol}
                onMoveDown={() => dispatch({ type: "move", symbol, direction: 1 })}
                onMoveUp={() => dispatch({ type: "move", symbol, direction: -1 })}
                onOpen={() => router.push(`/stock/${symbol}` as Href)}
                onRemove={() => setRemove(symbol)}
                quote={quotes[symbol]}
                trend={localWatchlistRows.find((row) => row.symbol === symbol)?.trend}
              />;
            })}
          </View>
        ) : (
          <EmptyState actionLabel="Search stocks" description="Add companies to build a focused daily signal list." onAction={() => router.push("/search" as Href)} title="Your watchlist is clear" />
        )}

        <Text style={styles.note}>Membership and ordering are stored on this device. {mode === "REAL" ? "Provider-backed quotes remain unavailable when a source cannot respond." : "Prices and trends are illustrative demo data."}</Text>
      </ScrollView>

      <ConfirmationModal
        description={`Remove ${remove ?? "this stock"} from your primary watchlist?`}
        onCancel={() => setRemove(null)}
        onConfirm={() => { if (remove) dispatch({ type: "remove", symbol: remove }); setRemove(null); }}
        title="Remove stock?"
        visible={Boolean(remove)}
      />
      <WatchlistLimitSheet onClose={() => setLimit(false)} visible={limit || preview === "limit"} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg, paddingBottom: 104, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg },
  headerAction: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2, paddingHorizontal: spacing.xs },
  headerActionText: { ...typography.label, color: colors.teal },
  pressed: { opacity: 0.62 },
  list: { marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  note: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  groupArea: { marginTop: spacing.sm },
  groupStrip: { gap: spacing.xs, paddingVertical: spacing.xs },
  groupChip: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.md, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  groupChipSelected: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  groupChipText: { ...typography.label, color: colors.textSecondary },
  groupChipTextSelected: { color: colors.background },
  askGroup: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  askGroupText: { ...typography.label, color: colors.textPrimary },
});
