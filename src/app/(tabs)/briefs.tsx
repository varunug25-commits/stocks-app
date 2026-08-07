import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import {
  BriefEmptyState,
  BriefFilterSheet,
  BriefHeroCard,
  BriefHistoryRow,
  BriefTypeSelector,
} from "@/components/briefs";
import {
  DemoDataBadge,
  ErrorState,
  OfflineBanner,
} from "@/components/foundation/Feedback";
import { Screen } from "@/components/foundation/Screen";
import { SectionHeader } from "@/components/foundation/SectionHeader";
import { SkeletonState } from "@/components/system/SkeletonState";
import {
  briefHistory,
  generateBrief,
  latestBriefSeed,
  type BriefType,
} from "@/data/briefs";
import { useBriefs } from "@/features/briefs/BriefsProvider";
import {
  selectBriefStatus,
  selectFilteredBriefs,
} from "@/features/briefs/selectors";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function BriefsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    view?: string;
    preview?: string;
  }>();
  const { state, dispatch, hydrated } = useBriefs();
  const { state: watchlistState, hydrated: watchlistHydrated } = useWatchlist();
  const reduceMotion = useReducedMotion();
  const [filterOpen, setFilterOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const previewType: BriefType | null =
    params.view === "morning" || params.view === "evening"
      ? params.view
      : null;
  const selectedType = previewType ?? state.selectedType;
  const symbols = useMemo(
    () => params.preview === "empty-watchlist" ? [] : watchlistState.symbols,
    [params.preview, watchlistState.symbols],
  );
  const latest = useMemo(
    () => generateBrief(latestBriefSeed(selectedType), symbols),
    [selectedType, symbols],
  );
  const visibleHistory = useMemo(
    () => selectFilteredBriefs(briefHistory, state),
    [state],
  );

  const retry = () => {
    setRetrying(true);
    router.setParams({ preview: undefined });
    setTimeout(() => setRetrying(false), 500);
  };
  if (!hydrated || !watchlistHydrated || retrying || params.preview === "loading")
    return (
      <Screen>
        <SkeletonState />
      </Screen>
    );
  if (params.preview === "error")
    return (
      <Screen>
        <View style={styles.center}>
          <ErrorState
            description="The local brief could not be assembled. Your read and saved states remain untouched."
            onRetry={retry}
            title="Briefs need a refresh"
          />
        </View>
      </Screen>
    );

  return (
    <Screen>
      {params.preview === "offline" ? <OfflineBanner /> : null}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.kickerRow}>
            <Text style={styles.kicker}>YOUR MARKET DAY</Text>
            <DemoDataBadge />
          </View>
          <Text style={styles.title}>Briefs</Text>
          <Text style={styles.subtitle}>
            What happened, why it matters, and what to monitor next—distilled
            into two calm moments.
          </Text>
        </View>
        <BriefTypeSelector
          onChange={(value) => dispatch({ type: "selectType", value })}
          value={selectedType}
        />
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(360)}
          style={styles.heroWrap}
        >
          <BriefHeroCard
            brief={latest}
            onPress={() => router.push(`/brief/${latest.id}` as Href)}
            status={selectBriefStatus(latest.id, state)}
          />
        </Animated.View>
        {!symbols.length ? (
          <View style={styles.emptyWrap}>
            <BriefEmptyState
              mode="watchlist"
              onAction={() => router.push("/search" as Href)}
            />
          </View>
        ) : null}
        <View style={styles.historySection}>
          <SectionHeader
            actionLabel="Filter"
            onAction={() => setFilterOpen(true)}
            title="Previous briefs"
          />
          <View style={styles.filterSummary}>
            <Ionicons color={colors.textTertiary} name="options-outline" size={15} />
            <Text style={styles.filterText}>
              {state.statusFilter === "all" ? "All statuses" : state.statusFilter} · {state.typeFilter === "all" ? "Morning + evening" : state.typeFilter}
            </Text>
          </View>
          {visibleHistory.length ? (
            <View style={styles.historyCard}>
              {visibleHistory.map((brief) => (
                <BriefHistoryRow
                  brief={brief}
                  key={brief.id}
                  onPress={() => router.push(`/brief/${brief.id}` as Href)}
                  status={selectBriefStatus(brief.id, state)}
                />
              ))}
            </View>
          ) : (
            <BriefEmptyState
              mode="history"
              onAction={() => {
                dispatch({ type: "statusFilter", value: "all" });
                dispatch({ type: "typeFilter", value: "all" });
              }}
            />
          )}
        </View>
        <Text style={styles.disclosure}>
          Briefs are assembled from typed local demo content. No live AI,
          market-data feed or external news service is connected.
        </Text>
      </ScrollView>
      <BriefFilterSheet
        onClose={() => setFilterOpen(false)}
        onStatus={(value) => dispatch({ type: "statusFilter", value })}
        onType={(value) => dispatch({ type: "typeFilter", value })}
        status={state.statusFilter}
        type={state.typeFilter}
        visible={filterOpen}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { width: "100%", maxWidth: 680, alignSelf: "center", padding: spacing.lg, paddingBottom: 118 },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg },
  header: { minHeight: 172, paddingTop: spacing.sm },
  kickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  kicker: { ...typography.caption, color: colors.teal, letterSpacing: 1.05 },
  title: { ...typography.display, color: colors.textPrimary, marginTop: spacing.md },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  heroWrap: { marginTop: spacing.lg },
  emptyWrap: { marginTop: spacing.md, borderRadius: radii.lg, backgroundColor: colors.surface },
  historySection: { gap: spacing.sm, marginTop: spacing.xxxl },
  filterSummary: { minHeight: 32, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  filterText: { ...typography.caption, color: colors.textTertiary, textTransform: "capitalize" },
  historyCard: { paddingHorizontal: spacing.md, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  disclosure: { ...typography.caption, color: colors.textTertiary, textAlign: "center", marginTop: spacing.xxl },
});
