import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CompanyLogo } from "@/components/finance/CompanyLogo";
import { WatchlistButton } from "./WatchlistButton";
import type { Company } from "@/data/stocks";
import { colors, spacing, typography } from "@/theme/tokens";
export function StockHeader({
  company,
  added,
  onToggle,
  onBack,
}: {
  company: Company;
  added: boolean;
  onToggle: () => void;
  onBack: () => void;
}) {
  return (
    <View>
      <View style={s.nav}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={onBack}
          style={s.back}
        >
          <Ionicons color={colors.textPrimary} name="arrow-back" size={22} />
        </Pressable>
        <Text style={s.symbol}>{company.symbol}</Text>
        <WatchlistButton added={added} onPress={onToggle} />
      </View>
      <View style={s.identity}>
        <CompanyLogo
          color={company.logoColor}
          name={company.name}
          size={52}
          symbol={company.symbol}
        />
        <View>
          <Text style={s.name}>{company.name}</Text>
          <Text style={s.meta}>
            {company.exchange} · {company.sector}
          </Text>
        </View>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  nav: {
    minHeight: 58,
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
  symbol: { ...typography.label, color: colors.textSecondary },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  name: { ...typography.title, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
});
