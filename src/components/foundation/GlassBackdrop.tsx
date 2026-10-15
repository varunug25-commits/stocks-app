import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";

export function GlassBackdrop({ intensity = 20 }: { intensity?: number }) {
  // Android/web retain the parent surface's opaque, inexpensive fallback.
  if (Platform.OS !== "ios") return null;
  return (
    <BlurView
      blurMethod="dimezisBlurViewSdk31Plus"
      blurReductionFactor={4}
      intensity={intensity}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      tint="systemUltraThinMaterialDark"
    />
  );
}
