import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme/tokens";
export function PriceMovement({
  price,
  change,
  percent,
}: {
  price: string;
  change: number;
  percent: number;
}) {
  const up = change >= 0;
  return (
    <View
      accessibilityLabel={`${price}, ${up ? "up" : "down"} ${Math.abs(change).toFixed(2)} dollars, ${Math.abs(percent).toFixed(2)} percent today`}
    >
      <Text style={s.price}>{price}</Text>
      <Text
        style={[s.change, { color: up ? colors.positive : colors.negative }]}
      >
        {up ? "▲ +" : "▼ −"}${Math.abs(change).toFixed(2)} · {up ? "+" : "−"}
        {Math.abs(percent).toFixed(2)}% today
      </Text>
    </View>
  );
}
const s = StyleSheet.create({
  price: {
    ...typography.display,
    fontSize: 40,
    lineHeight: 46,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  change: { ...typography.label, marginTop: spacing.xxs },
});
