import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BriefStatus, GeneratedBrief } from "@/data/briefs";
import { CompanyLogo } from "@/components/finance/CompanyLogo";
import { companyBySymbol } from "@/data/stocks";
import { colors, spacing, typography } from "@/theme/tokens";
import { BriefStatusBadge } from "./BriefStatusBadge";
import { BriefSummaryPoint } from "./BriefSummaryPoint";

export function BriefHeroCard({
  brief,
  status,
  onPress,
}: {
  brief: GeneratedBrief;
  status: BriefStatus;
  onPress: () => void;
}) {
  return (
    <View style={styles.publication}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Ionicons color={colors.textSecondary} name={brief.type === "morning" ? "sunny-outline" : "moon-outline"} size={18} />
          <Text style={styles.eyebrow}>
            {brief.type === "morning" ? "MORNING BRIEF" : "EVENING RECAP"}
          </Text>
        </View>
        <BriefStatusBadge status={status} />
      </View>
      <Text style={styles.title}>{brief.headline}</Text>
      <Text style={styles.summary}>{brief.summary}</Text>
      <View style={styles.points}>
        {brief.developments.map((point, index) => (
          <BriefSummaryPoint index={index} key={point} point={point} />
        ))}
      </View>
      <View style={styles.metaRow}>
        <View style={styles.logos}>
          {brief.watchlistImpacts.slice(0, 4).map((impact) => (
            <View key={impact.symbol} style={styles.logoWrap}>
              <CompanyLogo
                color={companyBySymbol[impact.symbol].logoColor}
                name={companyBySymbol[impact.symbol].name}
                size={30}
                symbol={impact.symbol}
              />
            </View>
          ))}
          {!brief.watchlistImpacts.length ? (
            <Text style={styles.emptyMeta}>Add stocks to personalize</Text>
          ) : null}
        </View>
        <Text style={styles.meta}>{brief.readingMinutes} min · {brief.timestamp}</Text>
      </View>
      <Pressable
        accessibilityLabel={`Read ${brief.type === "morning" ? "Morning Brief" : "Evening Recap"}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <Text style={styles.actionText}>Read full publication</Text>
        <Ionicons color={colors.teal} name="arrow-forward" size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  publication: { paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  identity: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  eyebrow: { ...typography.caption, color: colors.textTertiary, letterSpacing: 1 },
  title: { ...typography.heading, color: colors.textPrimary, marginTop: spacing.md },
  summary: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  points: { gap: spacing.sm, marginTop: spacing.md },
  metaRow: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, marginTop: spacing.md },
  logos: { flexDirection: "row", alignItems: "center" },
  logoWrap: { marginRight: -6, borderRadius: 18, borderWidth: 2, borderColor: "#10201E" },
  emptyMeta: { ...typography.caption, color: colors.warning },
  meta: { ...typography.caption, color: colors.textTertiary },
  action: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderSoft },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  actionText: { ...typography.label, color: colors.teal },
});
