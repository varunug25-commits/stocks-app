import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, typography } from "@/theme/tokens";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return <View style={styles.row}><View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.mark, compact && styles.compact]}><Svg height={22} viewBox="0 0 24 24" width={22}><Path d="M3 18V6l9 8 9-8v12M8 18v-4m8 4v-4" fill="none" stroke={colors.teal} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} /></Svg></View>{compact ? null : <Text style={styles.word}>MarketBrief</Text>}</View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  mark: { width: 44, height: 44, borderRadius: 13, backgroundColor: colors.tealMuted, alignItems: "center", justifyContent: "center" },
  compact: { width: 34, height: 34, borderRadius: 10 },
  word: { ...typography.heading, color: colors.textPrimary, letterSpacing: -0.4 },
});
