import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import {
  BriefEmptyState,
  BriefEventRow,
  BriefEvidenceCard,
  BriefMarketContext,
  BriefStockImpactRow,
  BriefSummaryPoint,
  BriefStatusBadge,
  SaveBriefButton,
  ShareBriefButton,
} from "@/components/briefs";
import { DemoDataBadge, OfflineBanner } from "@/components/foundation/Feedback";
import { Screen } from "@/components/foundation/Screen";
import { SectionHeader } from "@/components/foundation/SectionHeader";
import { EmptyState } from "@/components/system/EmptyState";
import { SkeletonState } from "@/components/system/SkeletonState";
import { AskMarketBriefEntry, IntelligencePanel } from "@/components/intelligence";
import {
  buildBriefShareText,
  findBriefSeed,
  generateBrief,
  getBriefShareResultMessage,
} from "@/data/briefs";
import { useBriefs } from "@/features/briefs/BriefsProvider";
import { selectBriefStatus } from "@/features/briefs/selectors";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { useMarketData } from "@/features/market-data/MarketDataProvider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function BriefDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ briefId?: string; preview?: string }>();
  const { state, dispatch, hydrated, realHistory } = useBriefs();
  const { state: watchlistState, hydrated: watchlistHydrated } = useWatchlist();
  const { mode } = useMarketData();
  const [shareMessage, setShareMessage] = useState("");
  const seed = typeof params.briefId === "string" ? findBriefSeed(params.briefId) : undefined;
  const symbols = useMemo(
    () => params.preview === "empty-watchlist" ? [] : watchlistState.symbols,
    [params.preview, watchlistState.symbols],
  );
  const brief = useMemo(
    () => mode === "DEMO" && seed ? generateBrief(seed, symbols, { insufficientEvidence: params.preview === "insufficient" }) : null,
    [mode, params.preview, seed, symbols],
  );
  const realBrief = mode === "REAL" && typeof params.briefId === "string" ? realHistory.find((record) => record.id === params.briefId) : undefined;
  useEffect(() => {
    if (brief && hydrated) dispatch({ type: "markRead", id: brief.id });
    if (realBrief && hydrated) dispatch({ type: "markRead", id: realBrief.id });
  }, [brief, dispatch, hydrated, realBrief]);

  if (!hydrated || !watchlistHydrated || params.preview === "loading")
    return <Screen><SkeletonState /></Screen>;
  if (mode === "REAL") {
    if (!realBrief) return <Screen><View style={styles.center}><EmptyState description="This validated edition is not stored on this device." title="Brief unavailable" /></View></Screen>;
    const realStatus = selectBriefStatus(realBrief.id, state);
    const realSaved = state.savedIds.includes(realBrief.id);
    const shareReal = async () => {
      const body = realBrief.response.sections.flatMap((section) => section.bullets.slice(0, 3).map((bullet) => `• ${bullet.text}`)).slice(0, 8).join("\n");
      try { const result = await Share.share({ title: "MarketBrief", message: `${realBrief.headline}\n\n${body}\n\nInformational only. Source-linked evidence is available in MarketBrief.` }); setShareMessage(getBriefShareResultMessage(result.action, Share.sharedAction, Share.dismissedAction)); } catch { setShareMessage("Sharing is unavailable. Your brief is unchanged."); }
    };
    return <Screen><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><View style={styles.nav}><Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Ionicons color={colors.textPrimary} name="arrow-back" size={23} /></Pressable><BriefStatusBadge status={realStatus} /></View><Text style={styles.eyebrow}>{realBrief.edition === "morning" ? "MORNING BRIEF" : "EVENING RECAP"} · VALIDATED</Text><Text style={styles.date}>{new Date(realBrief.generatedAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</Text><Text style={styles.meta}>{new Date(realBrief.generatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · {realBrief.providerMode === "live" ? "Live intelligence" : "Deterministic evidence summary"}</Text><Text style={styles.title}>{realBrief.headline}</Text><View style={styles.actions}><SaveBriefButton onPress={() => dispatch({ type: "toggleSaved", id: realBrief.id })} saved={realSaved} /><ShareBriefButton onPress={() => void shareReal()} /></View>{shareMessage ? <Text accessibilityLiveRegion="polite" style={styles.shareMessage}>{shareMessage}</Text> : null}<View style={styles.groundedDetail}><IntelligencePanel onRetry={() => router.replace(`/brief/${encodeURIComponent(realBrief.id)}` as Href)} resource={{ status: "ready", data: realBrief.response }} /></View><View style={styles.askEntry}><AskMarketBriefEntry detail="Ask within this edition’s current watchlist scope" label="Ask about this brief" onPress={() => router.push(`/ask?symbols=${realBrief.symbols.join(",")}&mode=current_brief&briefId=${encodeURIComponent(realBrief.id)}&prompt=${encodeURIComponent("What changed since this brief?")}` as Href)} /></View><View style={styles.disclaimer}><Ionicons color={colors.textTertiary} name="shield-checkmark-outline" size={19} /><Text style={styles.disclaimerText}>This saved edition preserves the validated, source-linked response generated at the time shown. Provider data may be delayed or incomplete. Not investment advice.</Text></View></ScrollView></Screen>;
  }
  if (!brief)
    return (
      <Screen>
        <View style={styles.center}>
          <EmptyState description="This local brief is not in the demo history." title="Brief unavailable" />
        </View>
      </Screen>
    );
  const saved = state.savedIds.includes(brief.id);
  const status = selectBriefStatus(brief.id, state);
  const share = async () => {
    const message = buildBriefShareText(brief);
    try {
      const result = await Share.share({ message, title: "MarketBrief" });
      setShareMessage(
        getBriefShareResultMessage(
          result.action,
          Share.sharedAction,
          Share.dismissedAction,
        ),
      );
    } catch {
      setShareMessage("Sharing is unavailable in this renderer. Your brief is unchanged.");
    }
  };

  return (
    <Screen>
      {params.preview === "offline" ? <OfflineBanner /> : null}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons color={colors.textPrimary} name="arrow-back" size={23} />
          </Pressable>
          <DemoDataBadge />
        </View>
        <View style={styles.identityRow}>
          <Text style={styles.eyebrow}>{brief.type === "morning" ? "MORNING BRIEF" : "EVENING RECAP"}</Text>
          <BriefStatusBadge status={status} />
        </View>
        <Text style={styles.date}>{brief.dateLabel}</Text>
        <Text style={styles.meta}>{brief.timestamp} · {brief.readingMinutes} min read · Local illustrative update</Text>
        <Text style={styles.title}>{brief.headline}</Text>
        <Text style={styles.summary}>{brief.summary}</Text>
        <View style={styles.actions}>
          <SaveBriefButton
            onPress={() => {
              void Haptics.selectionAsync();
              dispatch({ type: "toggleSaved", id: brief.id });
            }}
            saved={saved}
          />
          <ShareBriefButton onPress={() => void share()} />
        </View>
        <View style={styles.askEntry}>
          <AskMarketBriefEntry detail="Ask within this illustrative watchlist context" label="Ask about this brief" onPress={() => router.push(`/ask?prompt=${encodeURIComponent("What changed since this morning?")}` as Href)} />
        </View>
        {shareMessage ? <Text accessibilityLiveRegion="polite" style={styles.shareMessage}>{shareMessage}</Text> : null}

        <View style={styles.section}>
          <SectionHeader eyebrow="EXECUTIVE SUMMARY" title="Three developments" />
          <View style={styles.summaryCard}>
            {brief.developments.map((point, index) => <BriefSummaryPoint index={index} key={point} point={point} />)}
          </View>
        </View>
        <View style={styles.section}>
          <BriefMarketContext brief={brief} />
          {brief.changeSinceMorning ? (
            <View style={styles.changeCard}>
              <Text style={styles.changeLabel}>WHAT CHANGED SINCE MORNING</Text>
              <Text style={styles.changeText}>{brief.changeSinceMorning}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.section}>
          <SectionHeader eyebrow="PERSONALIZED" title="Your watchlist" />
          {brief.watchlistImpacts.length ? (
            <View style={styles.stack}>
              {brief.watchlistImpacts.map((impact) => (
                <BriefStockImpactRow impact={impact} key={impact.symbol} onPress={() => router.push(`/stock/${impact.symbol}` as Href)} />
              ))}
            </View>
          ) : (
            <BriefEmptyState mode="watchlist" onAction={() => router.push("/search" as Href)} />
          )}
        </View>
        <View style={styles.section}>
          <SectionHeader eyebrow="WHAT MATTERS NEXT" title={brief.type === "morning" ? "Today’s catalysts" : "Tomorrow’s setup"} />
          <View style={styles.eventCard}>
            {brief.events.map((event) => <BriefEventRow event={event} key={event.id} />)}
          </View>
          <View style={styles.monitorCard}>
            <Text style={styles.monitorTitle}>Three things to monitor</Text>
            {brief.monitor.map((item) => (
              <View key={item} style={styles.monitorRow}>
                <Ionicons color={colors.warning} name="eye-outline" size={18} />
                <Text style={styles.monitorText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={styles.scenarioRow}>
            <View style={[styles.scenario, styles.positive]}>
              <Text style={styles.scenarioLabel}>POSITIVE INTERPRETATION</Text>
              <Text style={styles.scenarioText}>{brief.positiveScenario}</Text>
            </View>
            <View style={[styles.scenario, styles.risk]}>
              <Text style={[styles.scenarioLabel, { color: colors.warning }]}>RISK INTERPRETATION</Text>
              <Text style={styles.scenarioText}>{brief.riskScenario}</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <SectionHeader eyebrow={`CONFIDENCE · ${brief.confidence.toUpperCase()}`} title={brief.sufficientEvidence ? "Evidence and uncertainty" : "Insufficient evidence"} />
          {!brief.sufficientEvidence ? (
            <View style={styles.insufficient}>
              <Ionicons color={colors.warning} name="alert-circle-outline" size={28} />
              <Text style={styles.insufficientTitle}>We won’t invent a reason</Text>
              <Text style={styles.insufficientText}>The available record confirms a move, not its cause. A company filing, direct statement or corroborated source could clarify it.</Text>
            </View>
          ) : null}
          <View style={styles.stack}>
            {brief.evidence.map((item) => (
              <BriefEvidenceCard
                item={item}
                key={item.kind}
                sources={brief.sources.filter((source) => item.sourceIds.includes(source.id))}
              />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <SectionHeader eyebrow="DEMO SOURCES" title="Sources and timestamps" />
          <View style={styles.sources}>
            {brief.sources.map((source) => (
              <View key={source.id} style={styles.source}>
                <Text style={styles.sourceName}>{source.name}</Text>
                <Text style={styles.sourceMeta}>{source.type} · {source.timestamp}</Text>
                <Text style={styles.sourceRelevance}>{source.relevance}</Text>
                <Text style={styles.sourceSupports}>Supports: {source.supports.join(" · ")}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.disclaimer}>
          <Ionicons color={colors.textTertiary} name="shield-checkmark-outline" size={19} />
          <Text style={styles.disclaimerText}>
            Brief prices and narratives are illustrative demo content, separate
            from provider-backed company data. Not investment advice. No buy,
            sell or hold recommendation. No guaranteed outcome.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg },
  nav: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: -8 },
  identityRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, marginTop: spacing.md },
  eyebrow: { ...typography.caption, color: colors.teal, letterSpacing: 1 },
  date: { ...typography.label, color: colors.textPrimary, marginTop: spacing.md },
  meta: { ...typography.caption, color: colors.textTertiary, marginTop: 3 },
  title: { ...typography.display, color: colors.textPrimary, marginTop: spacing.xl },
  summary: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  groundedDetail: { marginTop: spacing.xl },
  askEntry: { marginTop: spacing.lg },
  shareMessage: { ...typography.caption, color: colors.teal, marginTop: spacing.xs },
  section: { gap: spacing.xs, marginTop: spacing.xl },
  summaryCard: { gap: spacing.xs, paddingTop: spacing.xs, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  changeCard: { paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  changeLabel: { ...typography.caption, color: colors.teal, letterSpacing: .8 },
  changeText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  stack: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  eventCard: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, overflow: "hidden" },
  monitorCard: { paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  monitorTitle: { ...typography.label, color: colors.textPrimary, marginBottom: spacing.xs },
  monitorRow: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  monitorText: { ...typography.body, flex: 1, color: colors.textSecondary },
  scenarioRow: { gap: 0 },
  scenario: { paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  positive: { backgroundColor: colors.background },
  risk: { backgroundColor: colors.background },
  scenarioLabel: { ...typography.caption, color: colors.positive, letterSpacing: .8 },
  scenarioText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  insufficient: { alignItems: "center", padding: spacing.xl, borderRadius: radii.hero, backgroundColor: "#292317", borderWidth: 1, borderColor: "#5A4923" },
  insufficientTitle: { ...typography.heading, color: colors.warning, marginTop: spacing.sm },
  insufficientText: { ...typography.body, color: "#D8C79B", textAlign: "center", marginTop: spacing.xs },
  sources: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  source: { paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  sourceName: { ...typography.label, color: colors.textPrimary },
  sourceMeta: { ...typography.caption, color: colors.textTertiary, marginTop: 3 },
  sourceRelevance: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  sourceSupports: { ...typography.caption, color: colors.teal, marginTop: spacing.xs },
  disclaimer: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginTop: spacing.xxl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  disclaimerText: { ...typography.caption, flex: 1, color: colors.textTertiary },
});
