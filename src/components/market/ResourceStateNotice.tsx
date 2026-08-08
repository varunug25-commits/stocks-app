import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DataResource } from "@/data/real";
import { formatFreshness } from "@/data/real";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function ResourceStateNotice<T>({ resource, onRetry }: { resource: DataResource<T> | undefined; onRetry?: () => void }) {
  if (!resource) return <Text style={styles.loading}>Loading verified data…</Text>;
  if (resource.status === "idle" || resource.status === "loading")
    return <Text style={styles.loading}>Loading verified data…</Text>;
  if (resource.status === "ready" || resource.status === "stale")
    return <Text style={[styles.freshness, resource.status === "stale" && styles.warning]}>{formatFreshness(resource.meta)} · {resource.meta.source}</Text>;
  return (
    <View style={styles.error}>
      <Text style={styles.errorText}>{resource.status === "rate-limited" ? "Provider rate limit reached." : "message" in resource ? resource.message : "Real data is unavailable."}</Text>
      {onRetry ? <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  loading: { ...typography.caption, color: colors.textTertiary },
  freshness: { ...typography.caption, color: colors.textTertiary },
  warning: { color: colors.warning },
  error: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: radii.md, backgroundColor: "#292317" },
  errorText: { ...typography.caption, flex: 1, color: colors.warning },
  retry: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.sm },
  retryText: { ...typography.label, color: colors.teal },
});
