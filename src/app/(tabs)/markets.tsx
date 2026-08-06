import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { MarketIndexCard } from "@/components/finance/MarketIndexCard";
import { DemoDataBadge } from "@/components/foundation/Feedback";
import { Screen } from "@/components/foundation/Screen";
import { SectionHeader } from "@/components/foundation/SectionHeader";
import { EarningsEventCard } from "@/components/market/EarningsEventCard";
import { EconomicEventCard } from "@/components/market/EconomicEventCard";
import { FilterChip } from "@/components/market/FilterChip";
import { MarketMoodCard } from "@/components/market/MarketMoodCard";
import { MarketMoverRow } from "@/components/market/MarketMoverRow";
import { MarketStatusBadge } from "@/components/market/MarketStatusBadge";
import { SectorPerformanceCard } from "@/components/market/SectorPerformanceCard";
import { TimestampLabel } from "@/components/market/TimestampLabel";
import { AppBottomSheet } from "@/components/system/AppBottomSheet";
import { earningsEvents, economicEvents, marketIndices, marketMood, marketStatus, mostActive, sectors, topGainers, topLosers } from "@/data/markets";
import { colors, radii, spacing, typography } from "@/theme/tokens";

type Filter = "Overview" | "Gainers" | "Losers" | "Active";

export default function MarketsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("Overview");
  const [detail, setDetail] = useState<{ title: string; body: string } | null>(null);
  const movers = useMemo(() => filter === "Losers" ? topLosers : filter === "Active" ? mostActive : topGainers, [filter]);
  const choose = (next: Filter) => { void Haptics.selectionAsync(); setFilter(next); };

  return <Screen><ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><View style={styles.column}><View style={styles.header}><View><Text style={styles.eyebrow}>DISCOVER</Text><Text style={styles.title}>Markets</Text><Text style={styles.subtitle}>A clear view of what’s moving.</Text></View><Pressable accessibilityLabel="Search markets" accessibilityRole="button" onPress={() => router.push("/search" as Href)} style={styles.search}><Ionicons color={colors.textPrimary} name="search" size={22} /></Pressable></View><View style={styles.meta}><DemoDataBadge /><TimestampLabel label={marketStatus.updated} /></View><MarketStatusBadge status={marketStatus} />

  <View style={styles.section}><SectionHeader eyebrow="US MARKETS" title="Major indices" /><ScrollView contentContainerStyle={styles.horizontal} horizontal showsHorizontalScrollIndicator={false}>{marketIndices.map(index => <Pressable key={index.id} onPress={() => setDetail({ title: index.name, body: index.summary })}><MarketIndexCard index={index} /></Pressable>)}</ScrollView></View>
  <View style={styles.section}><MarketMoodCard {...marketMood} /></View>
  <View style={styles.section}><SectionHeader title="Sector performance" /><ScrollView contentContainerStyle={styles.horizontal} horizontal showsHorizontalScrollIndicator={false}>{sectors.map(sector => <SectorPerformanceCard key={sector.id} onPress={() => setDetail({ title: sector.name, body: `${sector.leaders} are the local demo leaders for this sector.` })} sector={sector} />)}</ScrollView></View>
  <View style={styles.section}><SectionHeader eyebrow="TODAY" title="Market movers" /><ScrollView contentContainerStyle={styles.chips} horizontal showsHorizontalScrollIndicator={false}>{(["Overview", "Gainers", "Losers", "Active"] as Filter[]).map(item => <FilterChip key={item} label={item} onPress={() => choose(item)} selected={filter === item} />)}</ScrollView><View style={styles.list}>{movers.map(mover => <MarketMoverRow key={mover.symbol} mover={mover} onPress={() => setDetail({ title: `${mover.name} · ${mover.symbol}`, body: `${mover.price} · ${mover.volume} demo volume. Full stock details arrive in Milestone 3.` })} />)}</View></View>
  <View style={styles.section}><SectionHeader eyebrow="COMING UP" title="Earnings preview" /><View style={styles.stack}>{earningsEvents.map(event => <EarningsEventCard event={event} key={event.id} />)}</View></View>
  <View style={styles.section}><SectionHeader title="Economic calendar" /><View style={styles.stack}>{economicEvents.map(event => <EconomicEventCard event={event} key={event.id} />)}</View></View>
  <View style={styles.disclosure}><Ionicons color={colors.textTertiary} name="information-circle-outline" size={18} /><Text style={styles.disclosureText}>Illustrative local data only. No live market service is connected.</Text></View></View></ScrollView>
  <AppBottomSheet onClose={() => setDetail(null)} title={detail?.title ?? "Market detail"} visible={Boolean(detail)}><Text style={styles.sheetBody}>{detail?.body}</Text><Text style={styles.sheetNote}>Local preview · educational, not investment advice.</Text></AppBottomSheet></Screen>;
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 118 }, column: { width: "100%", maxWidth: 680, alignSelf: "center", paddingHorizontal: spacing.lg }, header: { minHeight: 116, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingTop: spacing.md }, eyebrow: { ...typography.caption, color: colors.teal, letterSpacing: 1 }, title: { ...typography.display, color: colors.textPrimary, marginTop: spacing.xxs }, subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xxs }, search: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, meta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm }, section: { gap: spacing.sm, marginTop: spacing.xxl }, horizontal: { gap: spacing.sm, paddingRight: spacing.lg }, chips: { gap: spacing.xs, paddingRight: spacing.lg }, list: { paddingHorizontal: spacing.md, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }, stack: { gap: spacing.sm }, disclosure: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.xxxl, paddingTop: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }, disclosureText: { ...typography.caption, flex: 1, color: colors.textTertiary }, sheetBody: { ...typography.body, color: colors.textSecondary }, sheetNote: { ...typography.caption, color: colors.teal, marginTop: spacing.lg, marginBottom: spacing.lg },
});
