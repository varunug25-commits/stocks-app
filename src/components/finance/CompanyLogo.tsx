import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/tokens";

type CompanyLogoProps = {
  name: string;
  symbol: string;
  color?: string | null;
  size?: number;
};

export function CompanyLogo({ name, symbol, color = colors.surfaceElevated, size = 44 }: CompanyLogoProps) {
  return (
    <View
      accessibilityLabel={`${name} logo`}
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: size * 0.34,
          backgroundColor: color ?? colors.surfaceElevated,
        },
      ]}
    >
      <Text style={[styles.letter, { fontSize: size * 0.39 }]}>{symbol.slice(0, 1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF24",
  },
  letter: {
    color: colors.white,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
});
