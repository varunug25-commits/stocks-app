import { FontAwesome6 } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/tokens";

type CompanyLogoProps = {
  name: string;
  symbol: string;
  color?: string | null;
  size?: number;
};

// Licensed glyphs bundled with Expo; no remote logo service or invented marks.
const brands = {
  AAPL: { icon: "apple", ink: "#17191C", paper: "#F2F2F0" },
  MSFT: { icon: "microsoft", ink: "#8AC6EF", paper: "#162D3A" },
  GOOGL: { icon: "google", ink: "#82ADFA", paper: "#1B283B" },
  GOOG: { icon: "google", ink: "#82ADFA", paper: "#1B283B" },
  AMZN: { icon: "amazon", ink: "#F0BF7A", paper: "#30281E" },
  META: { icon: "meta", ink: "#82ADFA", paper: "#1B283B" },
} as const;

export function CompanyLogo({ name, symbol, size = 44 }: CompanyLogoProps) {
  const brand = brands[symbol as keyof typeof brands];
  return (
    <View
      accessibilityLabel={`${name} ${brand ? "logo" : "ticker"}`}
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: brand?.paper ?? colors.surfaceElevated,
          borderColor: brand ? "#FFFFFF12" : colors.border,
        },
      ]}
    >
      {brand ? <FontAwesome6 color={brand.ink} name={brand.icon} size={size * 0.53} /> : <Text style={[styles.letter, { fontSize: size * (symbol.length > 3 ? 0.22 : 0.27) }]}>{symbol.slice(0, 5)}</Text>}
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
    color: colors.textPrimary,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
