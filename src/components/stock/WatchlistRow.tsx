import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CompanyLogo } from "@/components/finance/CompanyLogo";
import { Sparkline } from "@/components/finance/Sparkline";
import type { DataResource, MarketQuote } from "@/data/real";
import { formatFreshness } from "@/data/real";
import type { Company } from "@/data/stocks";
import { formatPrice } from "@/data/stocks";
import { colors, numerals, spacing, typography } from "@/theme/tokens";

export function WatchlistRow({
  company,
  quote,
  editing,
  trend,
  onOpen,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  company: Company;
  quote?: DataResource<MarketQuote>;
  editing: boolean;
  trend?: number[];
  onOpen: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const resolved = quote?.status === "ready" || quote?.status === "stale" ? quote.data : null;
  const changePercent = resolved?.changePercent ?? null;
  const up = (changePercent ?? 0) >= 0;
  const displayPrice = resolved ? formatPrice(resolved.price) : quote?.status === "loading" || !quote ? "Loading…" : "Unavailable";
  const freshness = quote?.status === "ready" || quote?.status === "stale"
    ? `${quote.meta.source} · ${formatFreshness(quote.meta)}`
    : quote?.status === "loading" || !quote
      ? "Loading quote"
      : "Quote unavailable";

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel={`Open ${company.name} stock detail, ${displayPrice}${changePercent === null ? "" : `, ${up ? "up" : "down"} ${Math.abs(changePercent).toFixed(2)} percent today`}`}
        accessibilityRole="button"
        disabled={editing}
        onPress={onOpen}
        style={({ pressed }) => [styles.main, pressed && !editing && styles.pressed]}
      >
        <CompanyLogo color={company.logoColor} name={company.name} size={36} symbol={company.symbol} />
        <View style={styles.identity}>
          <Text style={styles.symbol}>{company.symbol}</Text>
          <Text numberOfLines={1} style={styles.company}>{company.name}</Text>
          <Text numberOfLines={1} style={styles.freshness}>{freshness}</Text>
        </View>
        {!editing && resolved && trend?.length ? <Sparkline height={28} points={trend} positive={up} width={54} /> : null}
        {!editing ? (
          <View style={styles.value}>
            <Text style={styles.price}>{displayPrice}</Text>
            <View style={styles.changeRow}>
              {changePercent !== null ? <Ionicons color={up ? colors.positive : colors.negative} name={up ? "caret-up" : "caret-down"} size={10} /> : null}
              <Text style={[styles.change, { color: changePercent === null ? colors.textTertiary : up ? colors.positive : colors.negative }]}>
                {changePercent === null ? "No quote" : `${up ? "+" : "−"}${Math.abs(changePercent).toFixed(2)}%`}
              </Text>
            </View>
          </View>
        ) : null}
      </Pressable>
      {editing ? (
        <View accessibilityLabel={`Edit ${company.symbol}`} style={styles.actions}>
          <Action label={`Move ${company.symbol} up`} icon="arrow-up" onPress={onMoveUp} />
          <Action label={`Move ${company.symbol} down`} icon="arrow-down" onPress={onMoveDown} />
          <Action label={`Remove ${company.symbol}`} icon="trash-outline" negative onPress={onRemove} />
        </View>
      ) : <Ionicons color={colors.textTertiary} name="chevron-forward" size={17} />}
    </View>
  );
}

function Action({ label, icon, onPress, negative = false }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; negative?: boolean }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={() => { void Haptics.selectionAsync(); onPress(); }}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      <Ionicons color={negative ? colors.negative : colors.textSecondary} name={icon} size={17} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 76, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  main: { minHeight: 76, flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  pressed: { opacity: 0.62 },
  identity: { flex: 1, minWidth: 78 },
  symbol: { ...typography.label, color: colors.textPrimary },
  company: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
  freshness: { ...typography.caption, color: colors.textTertiary, fontSize: 10, lineHeight: 13, marginTop: 1 },
  value: { minWidth: 78, alignItems: "flex-end" },
  price: { ...numerals, ...typography.label, color: colors.textPrimary },
  changeRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  change: { ...numerals, ...typography.caption },
  actions: { flexDirection: "row", alignItems: "center" },
  action: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
});
