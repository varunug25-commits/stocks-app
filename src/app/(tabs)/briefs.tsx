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
import { ProductHeader } from "@/components/foundation/ProductHeader";
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
import { colors, spacing, typography } from "@/theme/tokens";

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
        <ProductHeader actions={<DemoDataBadge />} eyebrow="PUBLICATION ARCHIVE" subtitle="Morning context and evening recap, clearly marked as local illustrative content." title="Briefs" />
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
            <View style={styles.historyList}>
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
          Brief narratives and price moves are illustrative demo content,
          separate from provider-backed company data. No recommendation is
          presented.
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
  scroll: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg, paddingBottom: 104, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg },
  heroWrap: { marginTop: spacing.md },
  emptyWrap: { marginTop: spacing.md },
  historySection: { gap: spacing.xs, marginTop: spacing.xl },
  filterSummary: { minHeight: 32, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  filterText: { ...typography.caption, color: colors.textTertiary, textTransform: "capitalize" },
  historyList: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  disclosure: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xxl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
