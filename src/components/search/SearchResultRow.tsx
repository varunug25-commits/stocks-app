import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CompanyLogo } from "@/components/finance/CompanyLogo";
import type { SearchStock } from "@/data/search";
import type { DataResource, MarketQuote } from "@/data/real";
import { formatPrice } from "@/data/stocks";
import { colors, numerals, spacing, typography } from "@/theme/tokens";

export function SearchResultRow({
  stock,
  onPress,
  added = false,
  onAdd,
  watchlistFull = false,
  quote,
}: {
  stock: SearchStock;
  onPress: () => void;
  added?: boolean;
  onAdd?: () => void;
  watchlistFull?: boolean;
  quote?: DataResource<MarketQuote>;
}) {
  const resolved = quote?.status === "ready" || quote?.status === "stale" ? quote.data : null;
  const changePercent = resolved?.changePercent ?? null;
  const positive = (changePercent ?? 0) >= 0;
  const price = resolved ? formatPrice(resolved.price) : quote?.status === "loading" ? "Loading…" : quote ? "Unavailable" : "Open for quote";
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel={`Open ${stock.name} stock detail`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.open, pressed && styles.pressed]}
      >
        <CompanyLogo
          color={stock.logoColor}
          name={stock.name}
          size={40}
          symbol={stock.symbol}
        />
        <View style={styles.copy}>
          <Text style={styles.symbol}>{stock.symbol}</Text>
          <Text numberOfLines={2} style={styles.meta}>{stock.name}</Text>
          <Text numberOfLines={1} style={styles.exchange}>{stock.exchange ?? stock.sector}</Text>
        </View>
        <View style={styles.value}>
          <Text style={styles.price}>{price}</Text>
          <Text
            style={[
              styles.change,
              { color: changePercent === null ? colors.textTertiary : positive ? colors.positive : colors.negative },
            ]}
          >
            {changePercent === null ? "View company" : `${positive ? "+" : ""}${changePercent.toFixed(2)}%`}
          </Text>
        </View>
      </Pressable>
      {onAdd ? (
        <Pressable
          accessibilityLabel={
            added
              ? `${stock.symbol} already in watchlist`
              : watchlistFull
                ? "Watchlist full, view limit"
              : `Add ${stock.symbol} to watchlist`
          }
          accessibilityRole="button"
          accessibilityState={{ disabled: added, selected: added }}
          disabled={added}
          onPress={onAdd}
          style={styles.add}
        >
          <Ionicons
            color={
              added ? colors.teal : watchlistFull ? colors.warning : colors.teal
            }
            name={added ? "checkmark-circle" : "add-circle-outline"}
            size={23}
          />
        </Pressable>
      ) : (
        <Ionicons
          color={colors.textTertiary}
          name="chevron-forward"
          size={18}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  open: {
    flex: 1,
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  add: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.68 },
  copy: { flex: 1, minWidth: 0, paddingVertical: spacing.sm },
  symbol: { ...typography.label, fontSize: 16, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
  exchange: { ...typography.caption, fontSize: 11, color: colors.textTertiary },
  value: { alignItems: "flex-end", maxWidth: 100 },
  price: { ...numerals, ...typography.label, color: colors.textPrimary },
  change: { ...typography.caption, marginTop: 2 },
});
