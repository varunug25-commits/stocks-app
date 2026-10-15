import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ProductHeader } from "@/components/foundation/ProductHeader";
import { GroupManager } from "@/components/profile/GroupManager";
import { Screen } from "@/components/foundation/Screen";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { useGroups } from "@/features/groups";
import { useTelemetry } from "@/features/telemetry";
import { LogoMark } from "@/components/foundation/LogoMark";
import { colors, spacing, typography } from "@/theme/tokens";

export default function ProfileScreen() {
  const { state: onboardingState } = useOnboarding();
  const { state: watchlistState } = useWatchlist();
  const groups = useGroups();
  const telemetry = useTelemetry();
  const preferenceSummary = [
    onboardingState.experience || "Experience not selected",
    `${onboardingState.goals.length} ${onboardingState.goals.length === 1 ? "goal" : "goals"}`,
    `${onboardingState.interests.length} ${onboardingState.interests.length === 1 ? "interest" : "interests"}`,
  ].join(" · ");

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ProductHeader eyebrow="MAKE IT YOURS" title="Profile" />
        <View style={styles.identity}><LogoMark compact /><View style={styles.copy}><Text style={styles.identityTitle}>Your MarketBrief</Text><Text style={styles.value}>{watchlistState.symbols.length} companies · Saved on this device</Text></View></View>

        <SettingsSection title="Personalization">
          <SettingRow icon="analytics-outline" label="Investor preferences" value={preferenceSummary} />
          <SettingRow icon="bookmark-outline" label="Watchlist" value={`${watchlistState.symbols.length} companies · ${watchlistState.symbols.join(" · ") || "None yet"}`} />
        </SettingsSection>

        <SettingsSection title="Watchlist groups">
          <GroupManager groups={groups.state.groups} onCreate={(name) => { groups.create(name); telemetry.track("group_created"); }} onRemove={groups.remove} />
        </SettingsSection>

        <SettingsSection title="Utility">
          <SettingRow icon="server-outline" label="Data & sources" value="Source and update time shown with each resource" />
          <SettingRow icon="moon-outline" label="Appearance" value="Dark" />
        </SettingsSection>

        <SettingsSection title="Legal & product">
          <SettingRow icon="shield-checkmark-outline" label="Privacy" value="Your preferences and lists are saved on this device" />
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
  scroll: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg, paddingBottom: 36, backgroundColor: colors.background },
  identity: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16 },
  identityTitle: { ...typography.heading, color: colors.textPrimary },
  section: { marginTop: spacing.xl },
  sectionTitle: { ...typography.caption, color: colors.textSecondary, letterSpacing: 1, textTransform: "uppercase", marginBottom: spacing.xs },
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  row: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  icon: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: colors.surface },
  copy: { flex: 1 },
  label: { ...typography.label, color: colors.textPrimary },
  value: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
});
