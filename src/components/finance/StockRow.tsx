import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CompanyLogo } from "@/components/finance/CompanyLogo";
import { Sparkline } from "@/components/finance/Sparkline";
import type { Stock } from "@/data/today";
import { colors, spacing, typography } from "@/theme/tokens";

type StockRowProps = {
  stock: Stock;
  onPress?: () => void;
};

export function StockRow({ stock, onPress }: StockRowProps) {
  const positive = stock.changePercent >= 0;
  const signedChange = `${positive ? "+" : ""}${stock.changePercent.toFixed(2)}%`;

  return (
    <Pressable
      accessibilityLabel={`${stock.name}, ${stock.price}, ${signedChange} today`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <CompanyLogo color={stock.logoColor} name={stock.name} symbol={stock.symbol} />
      <View style={styles.identity}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text numberOfLines={1} style={styles.name}>{stock.name}</Text>
      </View>
      <Sparkline points={stock.trend} positive={positive} />
      <View style={styles.valueWrap}>
        <Text style={styles.price}>{stock.price}</Text>
        <View style={styles.changeRow}>
          <Ionicons color={positive ? colors.positive : colors.negative} name={positive ? "caret-up" : "caret-down"} size={10} />
          <Text style={[styles.change, { color: positive ? colors.positive : colors.negative }]}>{signedChange.replace(/[+-]/, "")}</Text>
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
});

