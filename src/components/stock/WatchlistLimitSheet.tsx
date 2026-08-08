import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AppBottomSheet } from "@/components/system/AppBottomSheet";
import { colors, spacing, typography } from "@/theme/tokens";
export function WatchlistLimitSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <AppBottomSheet
      onClose={onClose}
      title="Watchlist is full"
      visible={visible}
    >
      <View style={s.row}>
        <Ionicons
          color={colors.warning}
          name="information-circle-outline"
          size={24}
        />
        <Text style={s.body}>
          Your watchlist supports up to five companies. Remove one before
          adding another.
        </Text>
      </View>
    </AppBottomSheet>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  body: { ...typography.body, flex: 1, color: colors.textSecondary },
});
