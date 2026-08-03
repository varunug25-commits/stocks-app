import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";

import { colors, radii } from "@/theme/tokens";

type IconButtonProps = {
  accessibilityLabel: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
  notification?: boolean;
};

export function IconButton({ accessibilityLabel, icon, onPress, notification }: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons color={colors.textPrimary} name={icon} size={21} />
      {notification ? <Ionicons color={colors.warning} name="ellipse" size={7} style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: colors.surfaceElevated,
  },
  dot: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

