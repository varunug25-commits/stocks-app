import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppBottomSheet } from "@/components/system/AppBottomSheet";
import type { IntelligenceSource } from "@/data/intelligence";
import { colors, spacing, typography } from "@/theme/tokens";

export function CitationSheet({ sources, visible, onClose, onSourceOpen }: { sources: IntelligenceSource[]; visible: boolean; onClose: () => void; onSourceOpen?: (source: IntelligenceSource) => void }) {
  return (
    <AppBottomSheet onClose={onClose} title={`Sources · ${sources.length}`} visible={visible}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {sources.map((source) => (
          <Pressable
            accessibilityLabel={`${source.publisher ?? "Source"}${source.sourceUrl ? ", open original source" : ""}`}
            accessibilityRole={source.sourceUrl ? "link" : "text"}
            disabled={!source.sourceUrl}
            key={source.id}
            onPress={() => { if (source.sourceUrl) { onSourceOpen?.(source); void Linking.openURL(source.sourceUrl); } }}
            style={styles.row}
          >
            <View style={styles.copy}>
              <Text style={styles.publisher}>{source.publisher ?? source.type.toUpperCase()}</Text>
              <Text numberOfLines={2} style={styles.title}>{source.title ?? `${source.symbol ?? "Market"} evidence`}</Text>
              <Text style={styles.meta}>{[source.symbol, source.publishedAt].filter(Boolean).join(" · ") || "Timestamp unavailable"}</Text>
            </View>
            {source.sourceUrl ? <Ionicons color={colors.teal} name="open-outline" size={18} /> : null}
          </Pressable>
        ))}
      </ScrollView>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  row: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  copy: { flex: 1 },
  publisher: { ...typography.label, color: colors.textPrimary },
  title: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  meta: { ...typography.caption, color: colors.textTertiary, marginTop: 3 },
});
