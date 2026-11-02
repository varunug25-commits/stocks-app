import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { MotionPressable as Pressable } from "@/components/motion";

import { CompanyLogo } from "@/components/finance/CompanyLogo";
import { Sparkline } from "@/components/finance/Sparkline";
import type { Stock } from "@/data/today";
import type { DataResource, MarketQuote } from "@/data/real";
import { formatFreshness } from "@/data/real";
import { formatPrice } from "@/data/stocks";
import { colors, numerals, spacing, typography } from "@/theme/tokens";

type StockRowProps = {
  stock: Stock;
  quote?: DataResource<MarketQuote>;
  onPress?: () => void;
  variant?: "row" | "card";
};

export function StockRow({ stock, quote, onPress, variant = "row" }: StockRowProps) {
  const resolved = quote?.status === "ready" || quote?.status === "stale" ? quote.data : null;
  const changePercent = resolved?.changePercent ?? null;
  const positive = (changePercent ?? 0) >= 0;
  const signedChange = changePercent === null ? "Unavailable" : `${positive ? "+" : ""}${changePercent.toFixed(2)}%`;
  const price = resolved ? formatPrice(resolved.price) : quote?.status === "loading" || !quote ? "Loading…" : "Unavailable";

  if (variant === "card") return (
    <Pressable accessibilityLabel={`${stock.name}, ${price}, ${signedChange} today`} accessibilityRole="button" onPress={onPress} scaleTo={0.975} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.cardTop}>
        <CompanyLogo color={stock.logoColor} name={stock.name} size={34} symbol={stock.symbol} />
        <Text style={[styles.cardChange, { color: changePercent === null ? colors.textTertiary : positive ? colors.positive : colors.negative }]}>{changePercent !== null ? positive ? "↑ " : "↓ " : ""}{signedChange}</Text>
      </View>
      <Text style={styles.cardSymbol}>{stock.symbol}</Text>
      <Text numberOfLines={1} style={styles.cardName}>{stock.name}</Text>
      <View style={styles.cardPriceRow}><Text style={styles.cardPrice}>{price}</Text>{resolved && stock.trend.length >= 2 && price.length < 9 ? <Sparkline height={22} points={stock.trend} positive={positive} width={30} /> : null}</View>
      <Text numberOfLines={2} style={styles.freshness}>{quote?.status === "ready" || quote?.status === "stale" ? `${quote.meta.source} · ${formatFreshness(quote.meta).replace(/^Updated /, "")}` : price === "Loading…" ? "Loading quote" : "Quote unavailable"}</Text>
    </Pressable>
  );

  return (
    <Pressable
      accessibilityLabel={`${stock.name}, ${price}, ${signedChange} today`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <CompanyLogo color={stock.logoColor} name={stock.name} size={38} symbol={stock.symbol} />
      <View style={styles.identity}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text numberOfLines={2} style={styles.name}>{stock.name}</Text>
        {quote?.status === "ready" || quote?.status === "stale" ? <Text numberOfLines={2} style={styles.freshness}>{quote.meta.provider === "demo" ? formatFreshness(quote.meta) : `${quote.meta.source} · ${formatFreshness(quote.meta).replace(/^Updated /, "")}`}</Text> : null}
      </View>
      {resolved && stock.trend.length >= 2 ? <Sparkline height={24} points={stock.trend} positive={positive} width={44} /> : null}
      <View style={styles.valueWrap}>
        <Text style={styles.price}>{price}</Text>
        <View style={styles.changeRow}>
          {changePercent !== null ? <Ionicons color={positive ? colors.positive : colors.negative} name={positive ? "caret-up" : "caret-down"} size={10} /> : null}
          <Text style={[styles.change, { color: changePercent === null ? colors.textTertiary : positive ? colors.positive : colors.negative }]}>{signedChange}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 176, minHeight: 188, padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 3 },
  cardPressed: { backgroundColor: colors.surfaceElevated },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4, marginBottom: 7 },
  cardChange: { ...typography.caption, ...numerals, fontWeight: "700" },
  cardSymbol: { ...typography.label, color: colors.textPrimary, fontSize: 17 },
  cardName: { ...typography.caption, color: colors.textSecondary },
  cardPriceRow: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  cardPrice: { ...numerals, fontSize: 22, lineHeight: 29, fontWeight: "700", letterSpacing: -0.7, color: colors.textPrimary },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: 0.66,
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
  symbol: {
    ...typography.label,
    fontSize: 16,
    color: colors.textPrimary,
  },
  name: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  valueWrap: {
    minWidth: 78,
    alignItems: "flex-end",
  },
  price: {
    ...numerals,
    ...typography.label,
    color: colors.textPrimary,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  change: {
    ...numerals,
    ...typography.caption,
  },
  freshness: { ...typography.caption, fontSize: 11, lineHeight: 15, color: colors.textTertiary },
});
