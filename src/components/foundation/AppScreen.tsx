import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@/theme/tokens";

type Props = PropsWithChildren<{ scroll?: boolean; keyboard?: boolean; padded?: boolean }>;

export function AppScreen({ children, scroll = false, keyboard = false, padded = false }: Props) {
  const content = scroll ? (
    <ScrollView contentContainerStyle={[styles.scroll, padded && styles.padded]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
  ) : <View style={[styles.content, padded && styles.padded]}>{children}</View>;
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.root}>
      {keyboard ? <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.content}>{content}</KeyboardAvoidingView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl, backgroundColor: colors.background },
  padded: { paddingHorizontal: spacing.lg },
});
