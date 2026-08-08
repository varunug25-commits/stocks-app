import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ConfidenceIndicator } from "@/components/stock/ConfidenceIndicator";
import { DriverRow } from "@/components/stock/DriverRow";
import { InterpretationCard } from "@/components/stock/InterpretationCard";
import { SourceList } from "@/components/stock/SourceList";
import { DataFreshnessBadge } from "@/components/stock/DataFreshnessBadge";
import { Screen } from "@/components/foundation/Screen";
import { EmptyState } from "@/components/system/EmptyState";
import {
  insights,
  isStockSymbol,
  sourceMetadata,
} from "@/data/stocks";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export default function WhyScreen() {
  const router = useRouter();
  const { symbol, preview } = useLocalSearchParams<{
    symbol?: string;
    preview?: string;
  }>();
  if (!isStockSymbol(symbol))
    return (
      <Screen>
        <EmptyState
          description="No explanation is available."
          title="Evidence unavailable"
        />
      </Screen>
    );
  const base = insights[symbol];
  const insight =
    preview === "insufficient"
      ? { ...base, sufficientEvidence: false, confidence: "Low" as const }
      : base;
  return (
    <Screen>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.nav}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={s.back}
          >
            <Ionicons color={colors.textPrimary} name="arrow-back" size={22} />
          </Pressable>
          <DataFreshnessBadge />
        </View>
        <Text style={s.eyebrow}>WHY {symbol} MOVED</Text>
        <Text style={s.title}>
          {insight.sufficientEvidence
            ? "Separate the signal from the story"
            : "Insufficient evidence"}
        </Text>
        <Text style={s.summary}>
          {insight.sufficientEvidence
            ? insight.summary
            : "The available local evidence does not support a confident explanation. Broad market flows may be contributing, but causation is not confirmed."}
        </Text>
        <ConfidenceIndicator level={insight.confidence} />
        {insight.sufficientEvidence ? (
          <>
            <View style={s.section}>
              <InterpretationCard
                kind="FACT"
                text={insight.confirmedFacts.join(" ")}
              />
              <InterpretationCard
                kind="INTERPRETATION"
                text={insight.interpretation}
              />
              <InterpretationCard
                kind="UNCERTAINTY"
                text={insight.uncertainty}
              />
            </View>
            <View style={s.section}>
              <Text style={s.heading}>Positive drivers</Text>
              <View style={s.card}>
                {insight.positive.map((item) => (
                  <DriverRow driver={item} key={item.id} />
                ))}
              </View>
            </View>
            <View style={s.section}>
              <Text style={s.heading}>Risks and negative drivers</Text>
              <View style={s.card}>
                {insight.negative.map((item) => (
                  <DriverRow driver={item} key={item.id} />
                ))}
              </View>
            </View>
            <View style={s.section}>
              <Text style={s.heading}>What to monitor next</Text>
              <View style={s.card}>
                {insight.monitor.map((item) => (
                  <View key={item} style={s.monitor}>
                    <Ionicons
                      color={colors.warning}
                      name="eye-outline"
                      size={18}
                    />
                    <Text style={s.monitorText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={s.insufficient}>
            <Ionicons
              color={colors.warning}
              name="alert-circle-outline"
              size={28}
            />
            <Text style={s.insufficientTitle}>We won’t invent a reason</Text>
            <Text style={s.insufficientBody}>
              Check back when a filing, company statement, or corroborated
              market source provides stronger evidence.
            </Text>
          </View>
        )}
        <View style={s.section}>
          <Text style={s.heading}>Sources and timestamps</Text>
          <View style={s.card}>
            <SourceList
              items={[
                sourceMetadata.sec,
                sourceMetadata.editorial,
                sourceMetadata.market,
              ]}
            />
          </View>
        </View>
        <Text style={s.disclaimer}>
          Facts and interpretation are illustrative demo content, not personalised
          investment advice. No buy, sell, hold, target price, or guaranteed
          outcome.
        </Text>
      </ScrollView>
    </Screen>
  );
}
const s = StyleSheet.create({
  scroll: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  nav: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.teal,
    letterSpacing: 1,
    marginTop: spacing.lg,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  summary: {
    ...typography.body,
    color: colors.textSecondary,
    marginVertical: spacing.md,
  },
  section: { gap: spacing.sm, marginTop: spacing.xxl },
  heading: { ...typography.heading, color: colors.textPrimary },
  card: {
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  monitor: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  monitorText: { ...typography.body, color: colors.textSecondary },
  insufficient: {
    alignItems: "center",
    padding: spacing.xl,
    marginTop: spacing.xxl,
    borderRadius: radii.hero,
    backgroundColor: "#292317",
    borderWidth: 1,
    borderColor: "#5A4923",
  },
  insufficientTitle: {
    ...typography.heading,
    color: colors.warning,
    marginTop: spacing.sm,
  },
  insufficientBody: {
    ...typography.body,
    color: "#D8C79B",
    textAlign: "center",
    marginTop: spacing.xs,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxxl,
  },
});
