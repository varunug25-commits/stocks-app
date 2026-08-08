import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import type { CompanyNewsArticle } from "@/data/real";
import { presentNewsArticle } from "@/data/real";
import { colors, spacing, typography } from "@/theme/tokens";
export function StoryRow({ item }: { item: CompanyNewsArticle }) {
  const story = presentNewsArticle(item);
  const parsedPublishedAt = Date.parse(story.publishedAt);
  const published = Number.isFinite(parsedPublishedAt)
    ? new Date(parsedPublishedAt).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })
    : story.publishedAt;
  const content = (
    <>
      <View style={s.copy}>
        <Text style={s.title}>{story.title}</Text>
        <Text style={s.meta}>{story.publisher} · {published}{story.external ? " · External source" : ""}</Text>
      </View>
      <Ionicons color={colors.textTertiary} name={story.external ? "open-outline" : "newspaper-outline"} size={18} />
    </>
  );
  if (story.sourceUrl) {
    return (
      <Pressable
        accessibilityLabel={`Open ${story.title} from ${story.publisher}`}
        accessibilityRole="link"
        onPress={() => void Linking.openURL(story.sourceUrl!)}
        style={({ pressed }) => [s.row, pressed && s.pressed]}
      >
        {content}
      </Pressable>
    );
  }
  return (
    <View style={s.row}>
      {content}
    </View>
  );
}
const s = StyleSheet.create({
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.68 },
  copy: { flex: 1 },
  title: { ...typography.label, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textTertiary, marginTop: 3 },
});
