import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { BriefEvent } from "@/data/briefs";
import { colors, spacing, typography } from "@/theme/tokens";

const icons = { earnings: "calendar-outline", filing: "document-text-outline", economic: "globe-outline", catalyst: "flash-outline" } as const;

export function BriefEventRow({ event }: { event: BriefEvent }) {
  return (
    <View accessibilityLabel={`${event.timing}, ${event.title}, ${event.detail}`} style={styles.row}>
      <View style={styles.icon}><Ionicons color={colors.teal} name={icons[event.kind]} size={19} /></View>
      <View style={styles.copy}>
        <Text style={styles.timing}>{event.timing}</Text>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.detail}>{event.detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 86, flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  icon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: colors.tealMuted },
  copy: { flex: 1 },
  timing: { ...typography.caption, color: colors.warning },
  title: { ...typography.label, color: colors.textPrimary, marginTop: 2 },
  detail: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
