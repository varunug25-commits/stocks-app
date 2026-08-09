import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { IntelligencePanel } from "@/components/intelligence";
import { Screen } from "@/components/foundation/Screen";
import type { IntelligenceContextMode, IntelligenceRequest, IntelligenceTask } from "@/data/intelligence";
import { isStockSymbol } from "@/data/stocks";
import { useIntelligenceRequest } from "@/features/intelligence/useIntelligenceRequest";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { useTheses } from "@/features/thesis";
import { useChangeDetection } from "@/features/materiality";
import { useBriefs } from "@/features/briefs/BriefsProvider";
import { useTelemetry } from "@/features/telemetry";
import { colors, radii, spacing, typography } from "@/theme/tokens";

const suggestions = [
  "Why did this stock move today?",
  "What are the next known catalysts?",
  "Summarize the latest filing.",
  "What important news affected my watchlist?",
];

function taskFromParam(value: string | undefined): IntelligenceTask {
  return value === "news_summary" || value === "filing_summary" ? value : "ask";
}
function modeFromParam(value: string | undefined, stockScoped: boolean): IntelligenceContextMode {
  if (value === "thesis" || value === "current_brief" || value === "since_last_check" || value === "catalysts") return value;
  return stockScoped ? "stock" : "watchlist";
}

export default function AskMarketBriefScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ symbol?: string; symbols?: string; task?: string; prompt?: string; focusId?: string; mode?: string; briefId?: string }>();
  const { state, hydrated } = useWatchlist();
  const theses = useTheses();
  const changes = useChangeDetection();
  const briefs = useBriefs();
  const telemetry = useTelemetry();
  const scopedSymbol = isStockSymbol(params.symbol) ? params.symbol : null;
  const routeSymbols = useMemo(() => typeof params.symbols === "string" ? params.symbols.split(",").map((symbol) => symbol.trim().toUpperCase()).filter(isStockSymbol).slice(0, 15) : [], [params.symbols]);
  const symbols = useMemo(() => scopedSymbol ? [scopedSymbol] : routeSymbols.length ? routeSymbols.filter((symbol) => state.symbols.includes(symbol)) : state.symbols, [routeSymbols, scopedSymbol, state.symbols]);
  const presetTask = taskFromParam(params.task);
  const contextMode = modeFromParam(params.mode, !!scopedSymbol);
  const savedThesis = scopedSymbol ? theses.state.bySymbol[scopedSymbol] : undefined;
  const comparisonAnchor = useMemo(() => {
    if (contextMode === "current_brief" && typeof params.briefId === "string") {
      const record = briefs.realHistory.find((item) => item.id === params.briefId);
      return record ? { generatedAt: record.generatedAt, sourceIds: record.response.sourceIds } : undefined;
    }
    if (contextMode === "since_last_check" && changes.result?.previousCapturedAt) return { generatedAt: changes.result.previousCapturedAt, sourceIds: [...new Set(changes.result.materialChanges.flatMap((change) => change.evidenceIds))] };
    return undefined;
  }, [briefs.realHistory, changes.result, contextMode, params.briefId]);
  const presetQuestion = typeof params.prompt === "string" ? params.prompt : "";
  const [question, setQuestion] = useState(presetQuestion);
  const [submitted, setSubmitted] = useState(presetTask !== "ask" || !!presetQuestion);
  const request = useMemo<IntelligenceRequest>(() => ({
    task: presetTask,
    symbols: symbols.length ? symbols : ["AAPL"],
    ...(presetTask === "ask" ? { question: question.trim() || "What changed in my watchlist?" } : {}),
    ...(params.focusId ? { focusId: params.focusId } : {}),
    timeWindow: "1D",
    contextMode,
    ...(contextMode === "thesis" && scopedSymbol && savedThesis ? { userThesis: { symbol: scopedSymbol, text: savedThesis } } : {}),
    ...(comparisonAnchor ? { comparisonAnchor } : {}),
  }), [comparisonAnchor, contextMode, params.focusId, presetTask, question, savedThesis, scopedSymbol, symbols]);
  const { resource, retry } = useIntelligenceRequest(request, hydrated && theses.hydrated && submitted && symbols.length > 0 && (contextMode !== "thesis" || !!savedThesis));

  const submit = (nextQuestion = question) => {
    const clean = nextQuestion.trim();
    if (!clean || !symbols.length) return;
    setQuestion(clean);
    setSubmitted(true);
    telemetry.track("ask_submitted", { task: presetTask, symbolsCount: symbols.length, mode: contextMode });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.nav}>
            <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
              <Ionicons color={colors.textPrimary} name="arrow-back" size={22} />
            </Pressable>
            <Text style={styles.navTitle}>Ask MarketBrief</Text>
            <View style={styles.navSpacer} />
          </View>
          <Text style={styles.eyebrow}>{contextMode === "thesis" && scopedSymbol ? `${scopedSymbol} · USER THESIS CONTEXT` : scopedSymbol ? `${scopedSymbol} CONTEXT` : `WATCHLIST · ${symbols.length} STOCKS`}</Text>
          <Text style={styles.title}>{presetTask === "news_summary" ? "Quick read" : presetTask === "filing_summary" ? "Filing intelligence" : "Ask from available evidence"}</Text>
          <Text style={styles.intro}>Answers are limited to quotes, relevant news, filings, events and company records already available to MarketBrief.</Text>

          {presetTask === "ask" ? (
            <>
              <View style={styles.composer}>
                <TextInput
                  accessibilityLabel="Question for MarketBrief"
                  maxLength={280}
                  multiline
                  onChangeText={(value) => { setQuestion(value); setSubmitted(false); }}
                  onSubmitEditing={() => submit()}
                  placeholder="What changed and what should I monitor?"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.input}
                  value={question}
                />
                <Pressable accessibilityLabel="Ask MarketBrief" accessibilityRole="button" disabled={!question.trim() || !symbols.length} onPress={() => submit()} style={[styles.send, (!question.trim() || !symbols.length) && styles.sendDisabled]}>
                  <Ionicons color={question.trim() && symbols.length ? colors.background : colors.disabledText} name="arrow-up" size={20} />
                </Pressable>
              </View>
              {!submitted ? (
                <View style={styles.suggestions}>
                  <Text style={styles.suggestionLabel}>SUGGESTED QUESTIONS</Text>
                  {(contextMode === "thesis" ? ["What new evidence relates to my thesis?", "What may clarify my thesis next?"] : contextMode === "since_last_check" ? ["Which changes were material?", "Which stocks had no meaningful developments?"] : contextMode === "current_brief" ? ["What evidence is newer than this brief?", "What known catalysts are next?"] : contextMode === "catalysts" ? ["What are my next known events?", "Which events are within seven days?"] : suggestions).map((suggestion) => (
                    <Pressable accessibilityRole="button" key={suggestion} onPress={() => submit(suggestion)} style={styles.suggestion}>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                      <Ionicons color={colors.teal} name="arrow-forward" size={16} />
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </>
          ) : null}

          {!symbols.length ? <Text style={styles.empty}>Add a stock to your watchlist before asking a watchlist question.</Text> : null}
          {contextMode === "thesis" && !savedThesis ? <Text style={styles.empty}>Save a thesis on this stock before comparing it with new evidence.</Text> : null}
          {submitted && symbols.length ? <View style={styles.result}><IntelligencePanel onRetry={() => void retry()} resource={resource} /></View> : null}
          <Text style={styles.disclosure}>Informational only. Confirmed facts remain source-linked; interpretation and uncertainty are labelled separately. No buy, sell or price-target guidance.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  nav: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: -8 },
  navTitle: { ...typography.label, color: colors.textPrimary },
  navSpacer: { width: 36 },
  eyebrow: { ...typography.caption, color: colors.teal, letterSpacing: 1, marginTop: spacing.lg },
  title: { ...typography.display, color: colors.textPrimary, marginTop: spacing.xs },
  intro: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, padding: spacing.sm, marginTop: spacing.xl, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  input: { ...typography.body, minHeight: 50, maxHeight: 120, flex: 1, color: colors.textPrimary, paddingHorizontal: spacing.xs, paddingVertical: spacing.sm },
  send: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.teal },
  sendDisabled: { backgroundColor: colors.disabled },
  suggestions: { marginTop: spacing.xl, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  suggestionLabel: { ...typography.caption, color: colors.textTertiary, letterSpacing: .8, paddingVertical: spacing.sm },
  suggestion: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  suggestionText: { ...typography.body, flex: 1, color: colors.textSecondary },
  result: { marginTop: spacing.xl },
  empty: { ...typography.body, color: colors.warning, marginTop: spacing.xl },
  disclosure: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xxl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
