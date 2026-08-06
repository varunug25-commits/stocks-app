import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { StockRow } from "@/components/finance/StockRow";
import { DemoDataBadge } from "@/components/foundation/Feedback";
import { Screen } from "@/components/foundation/Screen";
import { AppBottomSheet } from "@/components/system/AppBottomSheet";
import { EmptyState } from "@/components/system/EmptyState";
import { searchableStocks } from "@/data/search";
import { watchlist } from "@/data/today";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function WatchlistScreen() {
  const router = useRouter(); const { state } = useOnboarding(); const [selected, setSelected] = useState<string | null>(null);
  const stocks = useMemo(() => state.stocks.map(symbol => { const existing = watchlist.find(item => item.symbol === symbol); if (existing) return existing; const item = searchableStocks.find(stock => stock.symbol === symbol); return item ? { ...item, trend: item.changePercent >= 0 ? [20, 23, 22, 26, 28, 31, 35] : [39, 37, 38, 34, 31, 29, 27] } : null; }).filter((item): item is (typeof watchlist)[number] => Boolean(item)), [state.stocks]);
  return <Screen><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><View style={styles.header}><View><Text style={styles.eyebrow}>YOUR COMPANIES</Text><Text style={styles.title}>Watchlist</Text><Text style={styles.subtitle}>{stocks.length ? `${stocks.length} selected during onboarding` : "Build a focused list of companies."}</Text></View><DemoDataBadge /></View>{stocks.length ? <View style={styles.list}>{stocks.map(stock => <StockRow key={stock.symbol} onPress={() => setSelected(stock.symbol)} stock={stock} />)}</View> : <EmptyState actionLabel="Add a stock" description="Search the local company catalog and start your watchlist." onAction={() => router.push("/search" as Href)} title="No stocks yet" />}<Pressable accessibilityRole="button" onPress={() => router.push("/search" as Href)} style={styles.add}><Ionicons color={colors.background} name="add" size={20} /><Text style={styles.addText}>Add stock</Text></Pressable><View style={styles.note}><Ionicons color={colors.textTertiary} name="shield-checkmark-outline" size={18} /><Text style={styles.noteText}>Saved locally for this design milestone. No account or live price connection.</Text></View></ScrollView><AppBottomSheet onClose={() => setSelected(null)} title={`${selected ?? "Stock"} preview`} visible={Boolean(selected)}><Text style={styles.sheet}>Charts, company context, alerts and richer details arrive in Milestone 3.</Text></AppBottomSheet></Screen>;
}
const styles = StyleSheet.create({ scroll: { width: "100%", maxWidth: 680, alignSelf: "center", padding: spacing.lg, paddingBottom: 118 }, header: { minHeight: 130, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, eyebrow: { ...typography.caption, color: colors.teal, letterSpacing: 1 }, title: { ...typography.display, color: colors.textPrimary, marginTop: spacing.xxs }, subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs }, list: { paddingHorizontal: spacing.md, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }, add: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, marginTop: spacing.lg, borderRadius: radii.md, backgroundColor: colors.teal }, addText: { ...typography.label, fontSize: 16, color: colors.background }, note: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.xxl }, noteText: { ...typography.caption, flex: 1, color: colors.textTertiary }, sheet: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl } });
