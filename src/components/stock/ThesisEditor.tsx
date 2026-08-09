import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MAX_THESIS_LENGTH } from "@/features/thesis";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function ThesisEditor({ value, onSave, onAsk }: { value: string; onSave(value: string): Promise<void>; onAsk(): void }) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  useEffect(() => { if (!editing) setDraft(value); }, [editing, value]);
  const commit = async () => { await onSave(draft); setEditing(false); };
  return <View style={styles.box}>
    <View style={styles.header}><Text style={styles.label}>MY THESIS · USER CONTEXT</Text><Pressable accessibilityRole="button" onPress={() => setEditing((current) => !current)} style={styles.action}><Text style={styles.actionText}>{editing ? "Cancel" : value ? "Edit" : "Add"}</Text></Pressable></View>
    {editing ? <><TextInput accessibilityLabel="Personal investment thesis" maxLength={MAX_THESIS_LENGTH} multiline onChangeText={setDraft} placeholder="What do you follow this company for?" placeholderTextColor={colors.textTertiary} style={styles.input} value={draft} /><View style={styles.footer}><Text style={styles.count}>{draft.length}/{MAX_THESIS_LENGTH}</Text><Pressable accessibilityRole="button" onPress={() => void commit()} style={styles.save}><Text style={styles.saveText}>Save thesis</Text></Pressable></View></> : <><Text style={value ? styles.value : styles.empty}>{value || "Add what you monitor in this company. This remains your context, not verified evidence."}</Text>{value ? <Pressable accessibilityRole="button" onPress={onAsk} style={styles.ask}><Text style={styles.askText}>What changed vs my thesis?</Text></Pressable> : null}</>}
    <Text style={styles.disclosure}>Saved locally. If you ask a thesis question, this context is sent to the intelligence service and kept separate from verified evidence.</Text>
  </View>;
}

const styles = StyleSheet.create({
  box: { padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  header: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { ...typography.caption, color: colors.textSecondary, letterSpacing: .7 },
  action: { minWidth: 44, minHeight: 44, alignItems: "flex-end", justifyContent: "center" },
  actionText: { ...typography.label, color: colors.textPrimary },
  value: { ...typography.body, color: colors.textPrimary },
  empty: { ...typography.body, color: colors.textTertiary },
  input: { ...typography.body, minHeight: 112, color: colors.textPrimary, textAlignVertical: "top", padding: spacing.sm, borderRadius: radii.sm, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm },
  count: { ...typography.caption, color: colors.textTertiary },
  save: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.md, borderRadius: radii.sm, backgroundColor: colors.textPrimary },
  saveText: { ...typography.label, color: colors.background },
  ask: { minHeight: 44, justifyContent: "center", marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  askText: { ...typography.label, color: colors.textPrimary },
  disclosure: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.sm },
});
