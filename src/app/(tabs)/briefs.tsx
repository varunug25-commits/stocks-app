import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
  RealBriefHistoryRow,
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
import { EmptyState } from "@/components/system/EmptyState";
import { IntelligencePanel } from "@/components/intelligence";
import type { IntelligenceRequest } from "@/data/intelligence";
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
import { useMarketData } from "@/features/market-data/MarketDataProvider";
import { useIntelligenceRequest } from "@/features/intelligence/useIntelligenceRequest";
import { useChangeDetection } from "@/features/materiality";
import { compareRealBriefs } from "@/features/briefs/realStore";
import { colors, spacing, typography } from "@/theme/tokens";

export default function BriefsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    view?: string;
    preview?: string;
  }>();
  const { state, dispatch, hydrated, realHistory, saveRealBrief } = useBriefs();
  const { state: watchlistState, hydrated: watchlistHydrated } = useWatchlist();
  const { mode } = useMarketData();
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
    () => mode === "DEMO" ? generateBrief(latestBriefSeed(selectedType), symbols) : null,
    [mode, selectedType, symbols],
  );
  const visibleHistory = useMemo(
    () => selectFilteredBriefs(briefHistory, state),
    [state],
  );
  const intelligenceRequest = useMemo<IntelligenceRequest>(() => ({
    task: "brief",
    symbols: symbols.length ? symbols : ["AAPL"],
    edition: selectedType,
    timeWindow: "1D",
  }), [selectedType, symbols]);
  const { resource: intelligenceResource, retry: retryIntelligence } = useIntelligenceRequest(intelligenceRequest, mode === "REAL" && watchlistHydrated && symbols.length > 0);
  const changes = useChangeDetection();
  useEffect(() => {
    if (mode === "REAL" && intelligenceResource.status === "ready") void saveRealBrief(intelligenceResource.data, selectedType, changes.result?.comparedAt ?? null).catch(() => undefined);
  }, [changes.result?.comparedAt, intelligenceResource, mode, saveRealBrief, selectedType]);
  const realForEdition = realHistory.filter((record) => record.edition === selectedType);
  const briefDelta = realForEdition[0] ? compareRealBriefs(realForEdition[0], realForEdition[1]) : null;

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
        <ProductHeader actions={mode === "DEMO" ? <DemoDataBadge /> : undefined} eyebrow="PUBLICATION ARCHIVE" subtitle={mode === "REAL" ? "Source-linked watchlist context, compressed into a concise edition." : "Morning context and evening recap, clearly marked as illustrative content."} title="Briefs" />
        <BriefTypeSelector
          onChange={(value) => dispatch({ type: "selectType", value })}
          value={selectedType}
        />
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(360)}
          style={styles.heroWrap}
        >
          {mode === "REAL" ? (
            <View style={styles.groundedHero}>
              <IntelligencePanel onRetry={() => void retryIntelligence()} resource={intelligenceResource} />
              <Text style={styles.liveNote}>Generated from currently available provider evidence. Sources and uncertainty appear with the edition.</Text>
              {briefDelta ? <View style={styles.delta}><Text style={styles.deltaLabel}>SINCE PREVIOUS {selectedType === "morning" ? "MORNING BRIEF" : "EVENING RECAP"}</Text><Text style={styles.deltaText}>{briefDelta.newDevelopments} new {briefDelta.newDevelopments === 1 ? "development" : "developments"} · {briefDelta.newCatalysts} new {briefDelta.newCatalysts === 1 ? "catalyst" : "catalysts"} · {briefDelta.uncertaintiesResolved} {briefDelta.uncertaintiesResolved === 1 ? "uncertainty" : "uncertainties"} resolved</Text></View> : null}
            </View>
          ) : <BriefHeroCard brief={latest!} onPress={() => router.push(`/brief/${latest!.id}` as Href)} status={selectBriefStatus(latest!.id, state)} />}
        </Animated.View>
        {!symbols.length ? (
          <View style={styles.emptyWrap}>
            <BriefEmptyState
              mode="watchlist"
              onAction={() => router.push("/search" as Href)}
            />
          </View>
        ) : null}
        {mode === "DEMO" ? <View style={styles.historySection}>
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
        </View> : <View style={styles.historySection}><SectionHeader title="Previous briefs" />{realHistory.length ? <View style={styles.historyList}>{realHistory.map((record) => <RealBriefHistoryRow key={record.id} onPress={() => router.push(`/brief/${encodeURIComponent(record.id)}` as Href)} record={record} />)}</View> : <EmptyState description="A validated edition will appear here after it is generated." title="No brief history" />}</View>}
        <Text style={styles.disclosure}>
          {mode === "REAL" ? "Validated editions are saved on this device and remain separate from illustrative demo history. No recommendation is presented." : "Brief narratives and price moves are illustrative demo content, separate from provider-backed company data. No recommendation is presented."}
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
  groundedHero: { paddingTop: spacing.xs },
  readLink: { minHeight: 48, justifyContent: "center", paddingVertical: spacing.md },
  readLinkText: { ...typography.label, color: colors.teal },
  liveNote: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.sm },
  delta: { marginTop: spacing.md, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  deltaLabel: { ...typography.caption, color: colors.textSecondary, letterSpacing: .7 },
  deltaText: { ...typography.body, color: colors.textPrimary, marginTop: 3 },
  emptyWrap: { marginTop: spacing.md },
  historySection: { gap: spacing.xs, marginTop: spacing.xl },
  filterSummary: { minHeight: 32, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  filterText: { ...typography.caption, color: colors.textTertiary, textTransform: "capitalize" },
  historyList: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  disclosure: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xxl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
