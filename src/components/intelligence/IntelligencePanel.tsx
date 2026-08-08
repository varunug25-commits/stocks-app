import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ErrorState } from "@/components/foundation/Feedback";
import type { ClaimKind, IntelligenceResource } from "@/data/intelligence";
import { colors, spacing, typography } from "@/theme/tokens";
import { CitationSheet } from "./CitationSheet";
import { IntelligenceSkeleton } from "./IntelligenceSkeleton";

const kindLabel: Record<ClaimKind, string> = {
  confirmed: "CONFIRMED",
  interpretation: "INTERPRETATION",
  uncertainty: "UNCERTAINTY",
  catalyst: "CATALYST",
};
const kindColor: Record<ClaimKind, string> = {
  confirmed: colors.teal,
  interpretation: colors.textSecondary,
  uncertainty: colors.warning,
  catalyst: colors.warning,
};

export function IntelligencePanel({ resource, onRetry, showHeader = true }: {
  resource: IntelligenceResource;
  onRetry: () => void;
  showHeader?: boolean;
}) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  if (resource.status === "idle" || resource.status === "loading") return <IntelligenceSkeleton />;
  if (resource.status === "error" || resource.status === "rate-limited")
    return <ErrorState description={resource.message} onRetry={onRetry} title="Explanation unavailable" />;
  if (resource.status !== "ready") return null;
  const response = resource.data;
  return (
    <View style={styles.wrap}>
      {showHeader ? (
        <View style={styles.header}>
          <Text style={styles.provider}>{response.meta.providerMode === "mock" ? "GROUNDED PREVIEW" : "GROUNDED INTELLIGENCE"}</Text>
          {response.headline ? <Text style={styles.headline}>{response.headline}</Text> : null}
          {response.oneLineSummary ? <Text style={styles.summary}>{response.oneLineSummary}</Text> : null}
        </View>
      ) : null}
      {response.sections.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
          {section.bullets.map((bullet) => (
            <View key={bullet.id} style={styles.bulletRow}>
              <View style={[styles.marker, { backgroundColor: kindColor[bullet.kind] }]} />
              <View style={styles.bulletCopy}>
                <Text style={[styles.kind, { color: kindColor[bullet.kind] }]}>{kindLabel[bullet.kind]}</Text>
                <Text style={styles.bullet}>{bullet.text}</Text>
                {bullet.sourceIds.length ? <Text style={styles.citation}>Sources {bullet.sourceIds.map((id) => response.sourceIds.indexOf(id) + 1).filter((index) => index > 0).join(", ")}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      ))}
      <View style={styles.footer}>
        <Text style={styles.meta}>{response.meta.cached ? "Cached evidence" : "Fresh evidence"} · {response.meta.evidenceCount} records</Text>
        <Pressable accessibilityRole="button" disabled={!response.sources.length} onPress={() => setSourcesOpen(true)} style={styles.sourceButton}>
          <Text style={[styles.sourceButtonText, !response.sources.length && styles.disabled]}>Sources · {response.sources.length}</Text>
          <Ionicons color={response.sources.length ? colors.teal : colors.textTertiary} name="chevron-forward" size={16} />
        </Pressable>
      </View>
      <CitationSheet onClose={() => setSourcesOpen(false)} sources={response.sources} visible={sourcesOpen} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  header: { paddingVertical: spacing.md },
  provider: { ...typography.caption, color: colors.teal, letterSpacing: 1 },
  headline: { ...typography.heading, color: colors.textPrimary, marginTop: spacing.xs },
  summary: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  section: { paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderSoft },
  sectionTitle: { ...typography.caption, color: colors.textTertiary, letterSpacing: .9, marginBottom: spacing.xs },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, paddingVertical: spacing.xs },
  marker: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  bulletCopy: { flex: 1 },
  kind: { ...typography.caption, letterSpacing: .65 },
  bullet: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  citation: { ...typography.caption, color: colors.textTertiary, marginTop: 3 },
  footer: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  meta: { ...typography.caption, flex: 1, color: colors.textTertiary },
  sourceButton: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: spacing.xxs },
  sourceButtonText: { ...typography.label, color: colors.teal },
  disabled: { color: colors.textTertiary },
});
