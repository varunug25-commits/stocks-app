import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import type { MarketEvent } from "@/data/today";
import { colors, radii, spacing, typography } from "@/theme/tokens";

type EventCardProps = {
  event: MarketEvent;
};

export function EventCard({ event }: EventCardProps) {
  const accent = event.tone === "earnings" ? colors.teal : colors.warning;

  return (
    <View accessibilityLabel={`${event.day} ${event.date}, ${event.title}, ${event.time}`} style={styles.card}>
      <View style={styles.dateBlock}>
        <Text style={styles.day}>{event.day}</Text>
        <Text style={styles.date}>{event.date}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.copy}>
        <View style={styles.metaRow}>
          <Ionicons color={accent} name={event.tone === "earnings" ? "stats-chart" : "calendar"} size={13} />
          <Text style={[styles.time, { color: accent }]}>{event.time}</Text>
        </View>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.detail}>{event.detail}</Text>
      </View>
      {event.symbol ? <View style={styles.symbol}><Text style={styles.symbolText}>{event.symbol}</Text></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 100,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBlock: {
    width: 44,
    alignItems: "center",
  },
  day: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  date: {
    fontSize: 25,
    lineHeight: 29,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 1,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    marginHorizontal: spacing.md,
    backgroundColor: colors.border,
  },
  copy: {
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  time: {
    ...typography.caption,
  },
  title: {
    ...typography.label,
    color: colors.textPrimary,
    marginTop: 4,
  },
  detail: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  symbol: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSoft,
  },
  symbolText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
