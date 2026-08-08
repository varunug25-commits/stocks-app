import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AskMarketBriefEntry, IntelligencePanel } from "@/components/intelligence";
import { Screen } from "@/components/foundation/Screen";
import { EmptyState } from "@/components/system/EmptyState";
import type { IntelligenceRequest } from "@/data/intelligence";
import { isStockSymbol } from "@/data/stocks";
import { useIntelligenceRequest } from "@/features/intelligence/useIntelligenceRequest";
import { colors, spacing, typography } from "@/theme/tokens";

export default function WhyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ symbol?: string }>();
  const validSymbol = isStockSymbol(params.symbol) ? params.symbol : null;
  const request = useMemo<IntelligenceRequest>(() => ({
    task: "why_moved",
    symbols: validSymbol ? [validSymbol] : ["AAPL"],
    timeWindow: "1D",
  }), [validSymbol]);
  const { resource, retry } = useIntelligenceRequest(request, !!validSymbol);

  if (!validSymbol) return <Screen><View style={styles.center}><EmptyState description="No supported company context is available." title="Evidence unavailable" /></View></Screen>;
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Ionicons color={colors.textPrimary} name="arrow-back" size={22} />
          </Pressable>
          <Text style={styles.navTitle}>Why it moved</Text>
          <View style={styles.navSpacer} />
        </View>
        <Text style={styles.eyebrow}>WHY {validSymbol} MOVED</Text>
        <Text style={styles.title}>Evidence before explanation</Text>
        <Text style={styles.intro}>Confirmed facts, possible contributing factors and uncertainty remain separate. MarketBrief will not invent a cause.</Text>
        <View style={styles.panel}>
          <IntelligencePanel onRetry={() => void retry()} resource={resource} />
        </View>
        <View style={styles.ask}>
          <AskMarketBriefEntry detail="Ask a follow-up from the same source set" label={`Ask about ${validSymbol}`} onPress={() => router.push(`/ask?symbol=${validSymbol}` as Href)} />
        </View>
        <Text style={styles.disclaimer}>Informational only. No buy, sell, hold, target-price or guaranteed-outcome guidance.</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  center: { flex: 1, justifyContent: "center", padding: spacing.lg },
  nav: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: -8 },
  navTitle: { ...typography.label, color: colors.textPrimary },
  navSpacer: { width: 36 },
  eyebrow: { ...typography.caption, color: colors.teal, letterSpacing: 1, marginTop: spacing.lg },
  title: { ...typography.display, color: colors.textPrimary, marginTop: spacing.xs },
  intro: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  panel: { marginTop: spacing.xl },
  ask: { marginTop: spacing.xl },
  disclaimer: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xxl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
});
