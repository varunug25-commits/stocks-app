import { StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/foundation/Screen";
import { colors, spacing, typography } from "@/theme/tokens";

export default function TodayScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>MONDAY · MARKET OPEN</Text>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.body}>Your personalized market briefing is taking shape.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.teal,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

