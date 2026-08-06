import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export function MarketClosedState() { return <View accessibilityLabel="Market closed. Values show the previous session close." style={styles.card}><Ionicons color={colors.warning} name="moon-outline" size={24} /><View style={styles.copy}><Text style={styles.title}>Market closed</Text><Text style={styles.body}>Values show the previous session close. The next regular session opens at 9:30 AM ET.</Text></View></View>; }
const styles = StyleSheet.create({ card: { flexDirection: "row", gap: spacing.sm, padding: spacing.md, borderRadius: radii.lg, backgroundColor: "#292317", borderWidth: 1, borderColor: "#5A4923" }, copy: { flex: 1 }, title: { ...typography.label, color: colors.warning }, body: { ...typography.caption, color: "#D8C79B", marginTop: 3 } });
