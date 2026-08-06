import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ConfirmationModal,
  DemoDataBadge,
  ErrorState,
  OfflineBanner,
} from "@/components/foundation/Feedback";
import { Screen } from "@/components/foundation/Screen";
import { EmptyState } from "@/components/system/EmptyState";
import { SkeletonState } from "@/components/system/SkeletonState";
import { WatchlistLimitSheet } from "@/components/stock/WatchlistLimitSheet";
import { WatchlistRow } from "@/components/stock/WatchlistRow";
import { companyBySymbol, prices } from "@/data/stocks";
import type { StockSymbol } from "@/data/stocks";
import { WATCHLIST_LIMIT } from "@/features/watchlist/model";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export default function WatchlistScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const { state, dispatch, hydrated } = useWatchlist();
  const [expanded, setExpanded] = useState(true);
  const [remove, setRemove] = useState<StockSymbol | null>(null);
  const [limit, setLimit] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const handleRetry = () => {
    setRetrying(true);
    router.replace("/watchlist" as Href);
    setTimeout(() => setRetrying(false), 500);
  };
  if (!hydrated || retrying || preview === "loading")
    return (
      <Screen>
        <SkeletonState />
      </Screen>
    );
  if (preview === "error")
    return (
      <Screen>
        <View style={s.center}>
          <ErrorState
            description="Your local watchlist could not be displayed. Your stored order remains untouched."
            onRetry={handleRetry}
            title="Watchlist needs a refresh"
          />
        </View>
      </Screen>
    );
  const symbols = preview === "empty" ? [] : state.symbols;
  return (
    <Screen>
      {preview === "offline" ? <OfflineBanner /> : null}
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            colors={[colors.teal]}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 500);
            }}
            refreshing={refreshing}
            tintColor={colors.teal}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <View>
            <Text style={s.eyebrow}>YOUR SIGNALS</Text>
            <Text style={s.title}>Watchlist</Text>
            <Text style={s.subtitle}>
              {symbols.length} of {WATCHLIST_LIMIT} local free-plan spots
            </Text>
          </View>
          <DemoDataBadge />
        </View>
        <View style={s.toolbar}>
          <View style={s.segment}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: !expanded }}
              onPress={() => setExpanded(false)}
              style={[s.segmentItem, !expanded && s.segmentSelected]}
            >
              <Text style={[s.segmentText, !expanded && s.segmentTextSelected]}>
                Compact
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: expanded }}
              onPress={() => setExpanded(true)}
              style={[s.segmentItem, expanded && s.segmentSelected]}
            >
              <Text style={[s.segmentText, expanded && s.segmentTextSelected]}>
                Expanded
              </Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityLabel="Add stock"
            accessibilityRole="button"
            onPress={() =>
              state.symbols.length >= WATCHLIST_LIMIT
                ? setLimit(true)
                : router.push("/search" as Href)
            }
            style={s.add}
          >
            <Ionicons color={colors.background} name="add" size={20} />
            <Text style={s.addText}>Add</Text>
          </Pressable>
        </View>
        {symbols.length ? (
          <View>
            {symbols.map((symbol) => (
              <WatchlistRow
                company={companyBySymbol[symbol]}
                expanded={expanded}
                key={symbol}
                onMoveDown={() =>
                  dispatch({ type: "move", symbol, direction: 1 })
                }
                onMoveUp={() =>
                  dispatch({ type: "move", symbol, direction: -1 })
                }
                onOpen={() => router.push(`/stock/${symbol}` as Href)}
                onRemove={() => setRemove(symbol)}
                price={prices[symbol]}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            actionLabel="Search stocks"
            description="Add companies to build a focused daily signal list."
            onAction={() => router.push("/search" as Href)}
            title="Your watchlist is clear"
          />
        )}
        <Text style={s.note}>
          Ordering and membership are stored locally. Prices and reasons are
          illustrative.
        </Text>
      </ScrollView>
      <ConfirmationModal
        description={`Remove ${remove ?? "this stock"} from your primary watchlist?`}
        onCancel={() => setRemove(null)}
        onConfirm={() => {
          if (remove) dispatch({ type: "remove", symbol: remove });
          setRemove(null);
        }}
        title="Remove stock?"
        visible={Boolean(remove)}
      />
      <WatchlistLimitSheet onClose={() => setLimit(false)} visible={limit || preview === "limit"} />
    </Screen>
  );
}
const s = StyleSheet.create({
  scroll: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    padding: spacing.lg,
    paddingBottom: 118,
  },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg },
  header: {
    minHeight: 124,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eyebrow: { ...typography.caption, color: colors.teal, letterSpacing: 1 },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginTop: spacing.xxs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    padding: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  segmentItem: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
  },
  segmentSelected: { backgroundColor: colors.surfaceSoft },
  segmentText: { ...typography.label, color: colors.textTertiary },
  segmentTextSelected: { color: colors.textPrimary },
  add: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.teal,
  },
  addText: { ...typography.label, color: colors.background },
  note: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
