import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { AppScreen } from "@/components/foundation/AppScreen";
import { LogoMark } from "@/components/foundation/LogoMark";
import { loadMockSession, loadOnboarding } from "@/storage/preferences";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export default function SplashScreen() {
  const router = useRouter(); const reduceMotion = useReducedMotion(); const opacity = useSharedValue(.35);
  useEffect(() => { if (!reduceMotion) opacity.value = withRepeat(withTiming(1, { duration: 720 }), -1, true); }, [opacity, reduceMotion]);
  useEffect(() => { const timer = setTimeout(() => { void Promise.all([loadMockSession(), loadOnboarding()]).then(([session, onboarding]) => router.replace(session && onboarding?.completed ? "/(tabs)" : "/(auth)/login")); }, 1350); return () => clearTimeout(timer); }, [router]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <AppScreen><View style={styles.center}><Animated.View entering={FadeIn.duration(420)}><LogoMark /></Animated.View><Animated.Text entering={FadeInDown.delay(120).duration(420)} style={styles.line}>Smarter market context, in one clear brief.</Animated.Text><Animated.View accessibilityLabel="Preparing your local demo" accessibilityRole="progressbar" style={[styles.loader, animated]} /></View><Text style={styles.note}>Private local demo · no account or live market connection</Text></AppScreen>;
}
const styles = StyleSheet.create({ center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl }, line: { ...typography.body, color: colors.textSecondary, textAlign: "center", maxWidth: 270, marginTop: spacing.lg }, loader: { width: 58, height: 4, borderRadius: radii.pill, backgroundColor: colors.teal, marginTop: spacing.xxl }, note: { ...typography.caption, color: colors.textTertiary, textAlign: "center", padding: spacing.lg } });
