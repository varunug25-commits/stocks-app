import { StyleSheet, Text, View } from "react-native";

import { Sparkline } from "@/components/finance/Sparkline";
import type { MarketIndex } from "@/data/today";
import { colors, radii, spacing, typography } from "@/theme/tokens";

type MarketIndexCardProps = {
  index: MarketIndex;
};

export function MarketIndexCard({ index }: MarketIndexCardProps) {
  const positive = index.changePercent >= 0;
  const signedChange = `${positive ? "+" : ""}${index.changePercent.toFixed(2)}%`;

  return (
    <View
      accessibilityLabel={`${index.name}, ${index.value}, ${signedChange} today, market ${index.session.toLowerCase()}`}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.symbol}>{index.symbol}</Text>
          <Text style={styles.name}>{index.name}</Text>
        </View>
        <View style={styles.session}>
          <View style={styles.liveDot} />
          <Text style={styles.sessionText}>{index.session}</Text>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.value}>{index.value}</Text>
          <Text style={[styles.change, { color: positive ? colors.positive : colors.negative }]}>{signedChange}</Text>
        </View>
        <Sparkline height={34} points={index.trend} positive={positive} width={74} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 204,
    minHeight: 142,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  symbol: {
    ...typography.label,
    color: colors.textPrimary,
  },
  name: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 1,
  },
  session: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.tealMuted,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.teal,
  },
  sessionText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: colors.teal,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  value: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  change: {
    ...typography.caption,
    marginTop: 3,
  },
});

