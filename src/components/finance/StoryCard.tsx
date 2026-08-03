import { Pressable, StyleSheet, Text, View } from "react-native";

import { EditorialArtwork } from "@/components/finance/EditorialArtwork";
import { SourceCitation } from "@/components/finance/SourceCitation";
import type { Story } from "@/data/today";
import { colors, radii, spacing, typography } from "@/theme/tokens";

type StoryCardProps = {
  story: Story;
  onPress?: () => void;
};

export function StoryCard({ story, onPress }: StoryCardProps) {
  return (
    <Pressable
      accessibilityLabel={`${story.title}. ${story.readTime}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <EditorialArtwork height={118} story={story} />
      <View style={styles.content}>
        <Text style={styles.category}>{story.category}</Text>
        <Text numberOfLines={3} style={styles.title}>{story.title}</Text>
        <SourceCitation published={story.published} source={story.source} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 268,
    overflow: "hidden",
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  content: {
    padding: spacing.md,
    minHeight: 150,
  },
  category: {
    ...typography.caption,
    color: colors.teal,
    letterSpacing: 0.85,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
});

