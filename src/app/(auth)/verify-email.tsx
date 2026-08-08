import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { AuthScaffold } from "@/components/auth/AuthScaffold";
import { PrimaryButton, SecondaryButton, TextButton } from "@/components/foundation/Buttons";
import { InlineError } from "@/components/foundation/Feedback";
import { colors, spacing, typography } from "@/theme/tokens";

export default function VerifyEmailScreen() { const router = useRouter(); const { email = "you@example.com" } = useLocalSearchParams<{ email?: string }>(); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false); const resend = () => { setLoading(true); setTimeout(() => { setLoading(false); setMessage("A new demo verification is ready."); }, 600); }; const openMail = () => { void Linking.openURL("mailto:").catch(() => setMessage("No email app is available on this device.")); }; return <AuthScaffold description={`Demo verification for ${email}. No message was sent.`} title="Verify your email"><View style={styles.illustration}><Text style={styles.mail}>✉</Text></View>{message ? <InlineError message={message} /> : null}<PrimaryButton label="I’ve verified my email" onPress={() => router.push("/(onboarding)/welcome")} /><SecondaryButton label="Open email app" onPress={openMail} /><TextButton label={loading ? "Preparing…" : "Resend verification"} disabled={loading} onPress={resend} /><TextButton label="Change email address" onPress={() => router.back()} /></AuthScaffold>; }
const styles = StyleSheet.create({ illustration: { alignItems: "center", padding: spacing.xl }, mail: { fontSize: 38, color: colors.teal }, note: { ...typography.caption, color: colors.textTertiary } });
