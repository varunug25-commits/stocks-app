import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EditorialArtwork } from "@/components/finance/EditorialArtwork";
import { SourceCitation } from "@/components/finance/SourceCitation";
import type { Story } from "@/data/today";
import { colors, radii, spacing, typography } from "@/theme/tokens";

type EditorialHeroProps = {
  story: Story;
  onPress?: () => void;
};

export function EditorialHero({ story, onPress }: EditorialHeroProps) {
  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      accessibilityHint="Opens the full market story"
      accessibilityLabel={`${story.title}. ${story.summary}`}
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <EditorialArtwork height={292} story={story} />
      <View style={styles.content}>
        <View style={styles.kickerRow}>
          <Text style={styles.kicker}>{story.category}</Text>
          <View style={styles.readTime}>
            <Ionicons color="#DDE5E2" name="time-outline" size={13} />
            <Text style={styles.readTimeText}>{story.readTime}</Text>
          </View>
        </View>
        <Text style={styles.title}>{story.title}</Text>
        <Text numberOfLines={3} style={styles.summary}>{story.summary}</Text>
        <SourceCitation light published={story.published} source={story.source} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 390,
    borderRadius: radii.hero,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#2E4A45",
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.94,
  },
  content: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  kicker: {
    ...typography.caption,
    color: colors.teal,
    letterSpacing: 1.05,
  },
  readTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readTimeText: {
    ...typography.caption,
    color: "#DDE5E2",
  },
  title: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.55,
  },
  summary: {
    ...typography.body,
    color: "#C5D0CD",
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
});
