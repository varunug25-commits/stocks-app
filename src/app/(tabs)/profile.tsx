import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ProductHeader } from "@/components/foundation/ProductHeader";
import { Screen } from "@/components/foundation/Screen";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { colors, spacing, typography } from "@/theme/tokens";

export default function ProfileScreen() {
  const { state: onboardingState } = useOnboarding();
  const { state: watchlistState } = useWatchlist();
  const preferenceSummary = [
    onboardingState.experience || "Experience not selected",
    `${onboardingState.goals.length} goals`,
    `${onboardingState.interests.length} interests`,
  ].join(" · ");

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ProductHeader eyebrow="PROFILE" subtitle="Your saved preferences and data disclosures." title="Profile" />

        <SettingsSection title="Personalization">
          <SettingRow icon="analytics-outline" label="Investor preferences" value={preferenceSummary} />
          <SettingRow icon="bookmark-outline" label="Watchlist" value={`${watchlistState.symbols.length} companies · ${watchlistState.symbols.join(" · ") || "None yet"}`} />
        </SettingsSection>

        <SettingsSection title="Utility">
          <SettingRow icon="server-outline" label="Data & sources" value="Provider-backed company data when available · demo data clearly labeled" />
          <SettingRow icon="moon-outline" label="Appearance" value="Dark theme · system typography" />
        </SettingsSection>

        <SettingsSection title="Legal & product">
          <SettingRow icon="shield-checkmark-outline" label="Privacy" value="Local preferences; provider credentials remain server-side" />
          <SettingRow icon="information-circle-outline" label="Disclosures" value="Educational information only · not investment advice" />
          <SettingRow icon="information-outline" label="About" value="MarketBrief mobile app · version 0.1.0" />
        </SettingsSection>
      </ScrollView>
    </Screen>
  );
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.list}>{children}</View>
    </View>
  );
}

function SettingRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View accessibilityLabel={`${label}. ${value}`} style={styles.row}>
      <View style={styles.icon}><Ionicons color={colors.textSecondary} name={icon} size={18} /></View>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg, paddingBottom: 104, backgroundColor: colors.background },
  section: { marginTop: spacing.xl },
  sectionTitle: { ...typography.caption, color: colors.textTertiary, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: spacing.xs },
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  row: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  icon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: colors.surface },
  copy: { flex: 1 },
  label: { ...typography.label, color: colors.textPrimary },
  value: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
});
