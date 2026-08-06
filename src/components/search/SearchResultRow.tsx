import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CompanyLogo } from "@/components/finance/CompanyLogo";
import type { SearchStock } from "@/data/search";
import { colors, spacing, typography } from "@/theme/tokens";

export function SearchResultRow({
  stock,
  onPress,
  added = false,
  onAdd,
  disabled = false,
}: {
  stock: SearchStock;
  onPress: () => void;
  added?: boolean;
  onAdd?: () => void;
  disabled?: boolean;
}) {
  const positive = stock.changePercent >= 0;
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
          symbol={stock.symbol}
        />
        <View style={styles.copy}>
          <Text style={styles.symbol}>{stock.symbol}</Text>
          <Text numberOfLines={1} style={styles.meta}>
            {stock.name} · {stock.sector}
          </Text>
        </View>
        <View style={styles.value}>
          <Text style={styles.price}>{stock.price}</Text>
          <Text
            style={[
              styles.change,
              { color: positive ? colors.positive : colors.negative },
            ]}
          >
            {positive ? "+" : ""}
            {stock.changePercent.toFixed(2)}%
          </Text>
        </View>
      </Pressable>
      {onAdd ? (
        <Pressable
          accessibilityLabel={
            added
              ? `${stock.symbol} already in watchlist`
              : `Add ${stock.symbol} to watchlist`
          }
          accessibilityRole="button"
          accessibilityState={{ disabled: added || disabled, selected: added }}
          disabled={added}
          onPress={onAdd}
          style={styles.add}
        >
          <Ionicons
            color={
              added ? colors.positive : disabled ? colors.warning : colors.teal
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
  copy: { flex: 1 },
  symbol: { ...typography.label, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  value: { alignItems: "flex-end" },
  price: { ...typography.label, color: colors.textPrimary },
  change: { ...typography.caption, marginTop: 2 },
});
