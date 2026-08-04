import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthScaffold } from "@/components/auth/AuthScaffold";
import { PrimaryButton, TextButton } from "@/components/foundation/Buttons";
import { InlineError } from "@/components/foundation/Feedback";
import { FormField } from "@/components/foundation/FormField";
import { colors, spacing, typography } from "@/theme/tokens";

export default function ForgotPasswordScreen() {
  const router = useRouter(); const [email, setEmail] = useState(""); const [sent, setSent] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const send = () => { if (!email.includes("@")) { setError("Enter a valid email address."); return; } setError(""); setLoading(true); setTimeout(() => { setLoading(false); setSent(true); }, 650); };
  return <AuthScaffold description={sent ? "A mock reset link is ready. Nothing was sent outside this device." : "Enter your email to preview the reset experience."} title={sent ? "Check your inbox" : "Reset password"}>{sent ? <View style={styles.confirm}><Text style={styles.icon}>✓</Text><Text style={styles.body}>Reset instructions prepared for {email}</Text></View> : <FormField autoCapitalize="none" keyboardType="email-address" label="Email" onChangeText={setEmail} placeholder="you@example.com" value={email} />}{error ? <InlineError message={error} /> : null}<PrimaryButton label={sent ? "Send again" : "Send reset link"} loading={loading} onPress={send} /><TextButton label={sent ? "Use a different email" : "Back to login"} onPress={() => sent ? setSent(false) : router.replace("/(auth)/login")} /></AuthScaffold>;
}
const styles = StyleSheet.create({ confirm: { alignItems: "center", gap: spacing.md, padding: spacing.xl }, icon: { ...typography.title, color: colors.background, backgroundColor: colors.positive, borderRadius: 30, paddingHorizontal: 13, paddingVertical: 6 }, body: { ...typography.body, color: colors.textSecondary, textAlign: "center" } });
