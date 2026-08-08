import { Pressable, StyleSheet, Text, View } from "react-native";

import { SourceCitation } from "@/components/finance/SourceCitation";
import type { Story } from "@/data/today";
import { colors, spacing, typography } from "@/theme/tokens";

type StoryCardProps = {
  story: Story;
  onPress?: () => void;
};

export function StoryCard({ story, onPress }: StoryCardProps) {
  return (
    <Pressable
      accessibilityLabel={`${story.title}. ${story.readTime}`}
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={[styles.category, story.category === "MACRO" && styles.macro]}>{story.category}</Text>
          <SourceCitation published={story.published} source={story.source} />
        </View>
        <Text style={styles.title}>{story.title}</Text>
        <Text numberOfLines={2} style={styles.summary}>{story.summary}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 116,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  content: {
    paddingVertical: spacing.md,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  category: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 0.85,
  },
  macro: { color: colors.warning },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 6,
  },
  summary: { ...typography.caption, color: colors.textSecondary, marginTop: 5 },
});
