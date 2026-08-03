import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import type { Story } from "@/data/today";

type EditorialArtworkProps = {
  story: Story;
  height: number;
};

export function EditorialArtwork({ story, height }: EditorialArtworkProps) {
  return (
    <LinearGradient colors={story.palette} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.canvas, { height }]}>
      {story.artwork === "orbital" ? (
        <>
          <View style={styles.orbitLarge} />
          <View style={styles.orbitSmall} />
          <View style={styles.orb} />
          <View style={styles.beam} />
        </>
      ) : null}
      {story.artwork === "grid" ? (
        <>
          <View style={[styles.gridLine, { left: "19%" }]} />
          <View style={[styles.gridLine, { left: "45%" }]} />
          <View style={[styles.gridLine, { left: "71%" }]} />
          <View style={[styles.chip, { left: "16%", top: "28%" }]} />
          <View style={[styles.chip, styles.chipBright, { right: "14%", bottom: "18%" }]} />
        </>
      ) : null}
      {story.artwork === "waves" ? (
        <>
          <View style={[styles.wave, { bottom: -62, left: -46 }]} />
          <View style={[styles.wave, styles.waveSecond, { bottom: -88, right: -38 }]} />
          <View style={styles.sun} />
        </>
      ) : null}
      <LinearGradient colors={["transparent", "#05090BCC"]} style={StyleSheet.absoluteFill} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  canvas: {
    overflow: "hidden",
  },
  orbitLarge: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: "#7AF3D14D",
    top: -104,
    right: -24,
    transform: [{ rotate: "18deg" }],
  },
  orbitSmall: {
    position: "absolute",
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 1,
    borderColor: "#E8FFF84A",
    top: -25,
    right: 34,
  },
  orb: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#79F8D6",
    top: 42,
    right: 79,
    shadowColor: "#42E8C6",
    shadowOpacity: 0.7,
    shadowRadius: 26,
  },
  beam: {
    position: "absolute",
    width: 190,
    height: 1,
    backgroundColor: "#8FFFF055",
    top: 72,
    right: 38,
    transform: [{ rotate: "-24deg" }],
  },
  gridLine: {
    position: "absolute",
    top: -20,
    bottom: -20,
    width: 1,
    backgroundColor: "#A4B3FF24",
    transform: [{ rotate: "16deg" }],
  },
  chip: {
    position: "absolute",
    width: 66,
    height: 66,
    borderRadius: 16,
    backgroundColor: "#7C8DFF28",
    borderWidth: 1,
    borderColor: "#BAC2FF44",
    transform: [{ rotate: "14deg" }],
  },
  chipBright: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#8D9AFF66",
  },
  wave: {
    position: "absolute",
    width: 240,
    height: 150,
    borderRadius: 120,
    borderWidth: 22,
    borderColor: "#E8AF4D3D",
    transform: [{ rotate: "-9deg" }],
  },
  waveSecond: {
    borderColor: "#FFE2A12B",
    transform: [{ rotate: "12deg" }],
  },
  sun: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F5C667",
    top: 25,
    right: 40,
    opacity: 0.88,
  },
});

