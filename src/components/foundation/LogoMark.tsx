import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, typography } from "@/theme/tokens";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return <View style={styles.row}><LinearGradient colors={[colors.teal, "#1FAF98"]} style={[styles.mark, compact && styles.compact]}><Text style={[styles.glyph, compact && styles.glyphCompact]}>M</Text></LinearGradient>{compact ? null : <Text style={styles.word}>MarketBrief</Text>}</View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  mark: { width: 44, height: 44, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  compact: { width: 36, height: 36, borderRadius: 13 },
  glyph: { ...typography.heading, color: colors.background, fontWeight: "800" },
  glyphCompact: { fontSize: 17 },
  word: { ...typography.heading, color: colors.textPrimary, letterSpacing: -0.4 },
});
