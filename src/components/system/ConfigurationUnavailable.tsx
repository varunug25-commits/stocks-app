import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography } from "@/theme/tokens";

export function ConfigurationUnavailable() {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View accessibilityRole="alert" style={styles.content}>
        <View style={styles.icon}>
          <Ionicons color={colors.warning} name="cloud-offline-outline" size={24} />
        </View>
        <Text style={styles.eyebrow}>MARKET DATA UNAVAILABLE</Text>
        <Text style={styles.title}>MarketBrief unavailable</Text>
        <Text style={styles.body}>Live market configuration is incomplete. Try again after the application has been configured.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.lg },
  icon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  eyebrow: { ...typography.caption, color: colors.warning, letterSpacing: 0.8, marginTop: spacing.lg },
  title: { ...typography.display, color: colors.textPrimary, marginTop: spacing.xs },
  body: { ...typography.body, color: colors.textSecondary, maxWidth: 420, marginTop: spacing.sm },
});
