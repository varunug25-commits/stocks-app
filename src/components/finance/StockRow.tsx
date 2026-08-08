import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CompanyLogo } from "@/components/finance/CompanyLogo";
import { Sparkline } from "@/components/finance/Sparkline";
import type { Stock } from "@/data/today";
import type { DataResource, MarketQuote } from "@/data/real";
import { formatPrice } from "@/data/stocks";
import { colors, spacing, typography } from "@/theme/tokens";

type StockRowProps = {
  stock: Stock;
  quote?: DataResource<MarketQuote>;
  onPress?: () => void;
};

export function StockRow({ stock, quote, onPress }: StockRowProps) {
  const resolved = quote?.status === "ready" || quote?.status === "stale" ? quote.data : null;
  const changePercent = resolved?.changePercent ?? null;
  const positive = (changePercent ?? 0) >= 0;
  const signedChange = changePercent === null ? "Unavailable" : `${positive ? "+" : ""}${changePercent.toFixed(2)}%`;
  const price = resolved ? formatPrice(resolved.price) : quote?.status === "loading" || !quote ? "Loading…" : "Unavailable";

  return (
    <Pressable
      accessibilityLabel={`${stock.name}, ${price}, ${signedChange} today`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <CompanyLogo color={stock.logoColor} name={stock.name} symbol={stock.symbol} />
      <View style={styles.identity}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text numberOfLines={1} style={styles.name}>{stock.name}</Text>
      </View>
      {resolved ? <Sparkline points={stock.trend} positive={positive} /> : <View style={styles.sparkPlaceholder} />}
      <View style={styles.valueWrap}>
        <Text style={styles.price}>{price}</Text>
        <View style={styles.changeRow}>
          {changePercent !== null ? <Ionicons color={positive ? colors.positive : colors.negative} name={positive ? "caret-up" : "caret-down"} size={10} /> : null}
          <Text style={[styles.change, { color: changePercent === null ? colors.textTertiary : positive ? colors.positive : colors.negative }]}>{signedChange.replace(/[+-]/, "")}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: 0.66,
  },
  identity: {
    flex: 1,
    minWidth: 62,
  },
  symbol: {
    ...typography.label,
    color: colors.textPrimary,
  },
  name: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  valueWrap: {
    minWidth: 72,
    alignItems: "flex-end",
  },
  price: {
    ...typography.label,
    color: colors.textPrimary,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  change: {
    ...typography.caption,
  },
  sparkPlaceholder: { width: 68 },
});
