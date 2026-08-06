import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CompanyLogo } from "@/components/finance/CompanyLogo";
import type { Company, PriceSnapshot } from "@/data/stocks";
import { formatPrice } from "@/data/stocks";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export function WatchlistRow({
  company,
  price,
  expanded,
  onOpen,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  company: Company;
  price: PriceSnapshot;
  expanded: boolean;
  onOpen: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const up = price.change >= 0;
  return (
    <View style={s.card}>
      <Pressable
        accessibilityLabel={`Open ${company.name} stock detail, ${formatPrice(price.price)}, ${up ? "up" : "down"} ${Math.abs(price.changePercent).toFixed(2)} percent`}
        accessibilityRole="button"
        onPress={onOpen}
        style={s.main}
      >
        <CompanyLogo
          color={company.logoColor}
          name={company.name}
          size={44}
          symbol={company.symbol}
        />
        <View style={s.identity}>
          <Text style={s.symbol}>{company.symbol}</Text>
          <Text numberOfLines={1} style={s.reason}>
            {expanded
              ? `${company.name} · Demand and rates in focus`
              : company.name}
          </Text>
          {expanded ? (
            <Text style={s.event}>Next: earnings · Aug 27</Text>
          ) : null}
        </View>
        <View style={s.value}>
          <Text style={s.price}>{formatPrice(price.price)}</Text>
          <Text
            style={[
              s.change,
              { color: up ? colors.positive : colors.negative },
            ]}
          >
            {up ? "▲ +" : "▼ −"}
            {Math.abs(price.changePercent).toFixed(2)}%
          </Text>
        </View>
        <Ionicons
          color={colors.textTertiary}
          name="chevron-forward"
          size={18}
        />
      </Pressable>
      <View style={s.actions}>
        <Action label="Move up" icon="arrow-up" onPress={onMoveUp} />
        <Action label="Move down" icon="arrow-down" onPress={onMoveDown} />
        <Action
          label="Remove"
          icon="trash-outline"
          negative
          onPress={onRemove}
        />
      </View>
    </View>
  );
}
function Action({
  label,
  icon,
  onPress,
  negative = false,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  negative?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={s.action}
    >
      <Ionicons
        color={negative ? colors.negative : colors.textSecondary}
        name={icon}
        size={17}
      />
      <Text style={[s.actionText, negative && { color: colors.negative }]}>
        {label}
      </Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  main: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  identity: { flex: 1 },
  symbol: { ...typography.label, color: colors.textPrimary },
  reason: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  event: { ...typography.caption, color: colors.warning, marginTop: 3 },
  value: { alignItems: "flex-end" },
  price: { ...typography.label, color: colors.textPrimary },
  change: { ...typography.caption, marginTop: 2 },
  actions: {
    minHeight: 46,
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  action: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  actionText: { ...typography.caption, color: colors.textSecondary },
});
