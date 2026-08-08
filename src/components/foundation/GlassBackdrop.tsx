import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";

export function GlassBackdrop({ intensity = 20 }: { intensity?: number }) {
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
