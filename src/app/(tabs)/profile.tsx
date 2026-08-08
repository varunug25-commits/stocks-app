import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { DemoDataBadge } from "@/components/foundation/Feedback";
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
        <ProductHeader actions={<DemoDataBadge />} eyebrow="LOCAL PROFILE" subtitle="Preferences are stored on this device; no account or authentication is connected." title="Profile" />

        <SettingsSection title="Access">
          <SettingRow icon="card-outline" label="Subscription" value="Not connected in this milestone" />
        </SettingsSection>

        <SettingsSection title="Personalization">
          <SettingRow icon="analytics-outline" label="Investor preferences" value={preferenceSummary} />
          <SettingRow icon="bookmark-outline" label="Watchlist" value={`${watchlistState.symbols.length} companies · ${watchlistState.symbols.join(" · ") || "None yet"}`} />
        </SettingsSection>

        <SettingsSection title="Utility">
          <SettingRow icon="notifications-outline" label="Alerts" value={onboardingState.notificationsEnabled ? "Local notification preference enabled" : "Local notification preference off"} />
          <SettingRow icon="server-outline" label="Data & sources" value="Company data through MarketBrief backend when REAL mode is configured" />
          <SettingRow icon="moon-outline" label="Appearance" value="Dark theme · system typography" />
        </SettingsSection>

        <SettingsSection title="Legal & product">
          <SettingRow icon="shield-checkmark-outline" label="Privacy" value="Local preferences; provider credentials remain server-side" />
          <SettingRow icon="information-circle-outline" label="Disclosures" value="Educational information only · not investment advice" />
          <SettingRow icon="code-slash-outline" label="About" value="MarketBrief mobile foundation · no M7 AI" />
        </SettingsSection>

        <View style={styles.notice}>
          <Ionicons color={colors.warning} name="alert-circle-outline" size={18} />
          <Text style={styles.noticeText}>Subscription, authentication, payments, trading accounts and live alerts are not implemented. These rows report product status and do not trigger unavailable flows.</Text>
        </View>
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
  notice: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  noticeText: { ...typography.caption, flex: 1, color: colors.textTertiary },
});
