import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme/tokens";

type SourceCitationProps = {
  source: string;
  published: string;
  light?: boolean;
};

export function SourceCitation({ source, published, light = false }: SourceCitationProps) {
  const color = light ? "#DDE5E2" : colors.textTertiary;

  return (
    <View accessibilityLabel={`Source: ${source}, ${published}`} style={styles.row}>
      <Ionicons color={color} name="newspaper-outline" size={13} />
      <Text numberOfLines={1} style={[styles.text, { color }]}>{source}</Text>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{published}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  text: {
    ...typography.caption,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    opacity: 0.7,
    marginHorizontal: 2,
  },
});

