import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppBottomSheet } from "@/components/system/AppBottomSheet";
import type { BriefStatusFilter, BriefTypeFilter } from "@/features/briefs/model";
import { colors, radii, spacing, typography } from "@/theme/tokens";

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.option, selected && styles.selected]}>
      <Text style={[styles.optionText, selected && styles.selectedText]}>{label}</Text>
      {selected ? <Ionicons color={colors.teal} name="checkmark" size={19} /> : null}
    </Pressable>
  );
}

export function BriefFilterSheet({ visible, status, type, onStatus, onType, onClose }: { visible: boolean; status: BriefStatusFilter; type: BriefTypeFilter; onStatus: (value: BriefStatusFilter) => void; onType: (value: BriefTypeFilter) => void; onClose: () => void }) {
  return (
    <AppBottomSheet onClose={onClose} title="Filter brief history" visible={visible}>
      <Text style={styles.heading}>Status</Text>
      <View accessibilityRole="radiogroup" style={styles.group}>
        <Option label="All briefs" onPress={() => onStatus("all")} selected={status === "all"} />
        <Option label="Saved" onPress={() => onStatus("saved")} selected={status === "saved"} />
        <Option label="Unread" onPress={() => onStatus("unread")} selected={status === "unread"} />
      </View>
      <Text style={styles.heading}>Brief type</Text>
      <View accessibilityRole="radiogroup" style={styles.group}>
        <Option label="Morning and evening" onPress={() => onType("all")} selected={type === "all"} />
        <Option label="Morning only" onPress={() => onType("morning")} selected={type === "morning"} />
        <Option label="Evening only" onPress={() => onType("evening")} selected={type === "evening"} />
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  heading: { ...typography.label, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs },
  group: { gap: spacing.xs },
  option: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, borderRadius: radii.md, backgroundColor: colors.surface },
  selected: { backgroundColor: colors.tealMuted },
  optionText: { ...typography.body, color: colors.textSecondary },
  selectedText: { color: colors.textPrimary },
});
