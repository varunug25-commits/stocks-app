# Shared UI Components

Framework: React Native 0.86 with Expo Router 57. Components use custom `StyleSheet` primitives, Expo Vector Icons, Reanimated, Gesture Handler and Safe Area Context; no third-party component library or CSS framework is present.

## Buttons

- Path: `src/components/foundation/Buttons.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
import * as Haptics from "expo-haptics";
import type { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";

type Props = PropsWithChildren<{ label: string; onPress: () => void; disabled?: boolean; loading?: boolean; accessibilityLabel?: string }>;
function Base({ label, onPress, disabled, loading, kind, accessibilityLabel }: Props & { kind: "primary" | "secondary" }) {
  return <Pressable accessibilityLabel={accessibilityLabel ?? label} accessibilityRole="button" accessibilityState={{ disabled, busy: loading }} disabled={disabled || loading} onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }} style={({ pressed }) => [styles.base, kind === "primary" ? styles.primary : styles.secondary, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>{loading ? <ActivityIndicator color={kind === "primary" ? colors.background : colors.teal} /> : <Text style={[styles.label, kind === "primary" ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>}</Pressable>;
}
export function PrimaryButton(props: Props) { return <Base {...props} kind="primary" />; }
export function SecondaryButton(props: Props) { return <Base {...props} kind="secondary" />; }
export function TextButton({ label, onPress, disabled }: Omit<Props, "children">) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={styles.textButton}><Text style={[styles.textLabel, disabled && styles.disabledText]}>{label}</Text></Pressable>; }
const styles = StyleSheet.create({
  base: { minHeight: 54, borderRadius: radii.md, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg }, primary: { backgroundColor: colors.teal }, secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled }, pressed: { opacity: .82, transform: [{ scale: .99 }] }, label: { ...typography.label, fontSize: 16 }, primaryLabel: { color: colors.background }, secondaryLabel: { color: colors.textPrimary }, textButton: { minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.sm }, textLabel: { ...typography.label, color: colors.teal }, disabledText: { color: colors.disabledText },
});
```

## IconButton

- Path: `src/components/foundation/IconButton.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
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

```

## SectionHeader

- Path: `src/components/foundation/SectionHeader.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme/tokens";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ eyebrow, title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.teal,
    letterSpacing: 1.05,
    marginBottom: spacing.xxs,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  action: {
    minHeight: 44,
    justifyContent: "center",
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionText: {
    ...typography.label,
    color: colors.teal,
  },
});

```

## Screen

- Path: `src/components/foundation/Screen.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme/tokens";

export function Screen({ children }: PropsWithChildren) {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
});

```

## AppScreen

- Path: `src/components/foundation/AppScreen.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@/theme/tokens";

type Props = PropsWithChildren<{ scroll?: boolean; keyboard?: boolean; padded?: boolean }>;

export function AppScreen({ children, scroll = false, keyboard = false, padded = false }: Props) {
  const content = scroll ? (
    <ScrollView contentContainerStyle={[styles.scroll, padded && styles.padded]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
  ) : <View style={[styles.content, padded && styles.padded]}>{children}</View>;
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.root}>
      {keyboard ? <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.content}>{content}</KeyboardAvoidingView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl },
  padded: { paddingHorizontal: spacing.lg },
});
```

## AppHeader

- Path: `src/components/foundation/AppHeader.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/theme/tokens";
import { LogoMark } from "./LogoMark";

export function AppHeader({ title, back = false, actionLabel, onAction }: { title?: string; back?: boolean; actionLabel?: string; onAction?: () => void }) {
  const router = useRouter();
  return <View style={styles.row}>{back ? <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.icon}><Ionicons color={colors.textPrimary} name="arrow-back" size={22} /></Pressable> : <LogoMark compact />}<Text numberOfLines={1} style={styles.title}>{title}</Text>{actionLabel ? <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}><Text style={styles.actionText}>{actionLabel}</Text></Pressable> : <View style={styles.spacer} />}</View>;
}
const styles = StyleSheet.create({
  row: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: spacing.sm }, title: { ...typography.label, flex: 1, color: colors.textPrimary, textAlign: "center" },
  icon: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }, spacer: { width: 44 }, action: { minWidth: 44, minHeight: 44, alignItems: "flex-end", justifyContent: "center" }, actionText: { ...typography.label, color: colors.teal },
});
```

## CompanyLogo

- Path: `src/components/finance/CompanyLogo.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/tokens";

type CompanyLogoProps = {
  name: string;
  symbol: string;
  color: string;
  size?: number;
};

export function CompanyLogo({ name, symbol, color, size = 44 }: CompanyLogoProps) {
  return (
    <View
      accessibilityLabel={`${name} logo`}
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: size * 0.34,
          backgroundColor: color,
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

```

## StockRow

- Path: `src/components/finance/StockRow.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { CompanyLogo } from "@/components/finance/CompanyLogo";
import { Sparkline } from "@/components/finance/Sparkline";
import type { Stock } from "@/data/today";
import type { DataResource, MarketQuote } from "@/data/real";
import { formatPrice } from "@/data/stocks";
import { colors, spacing, typography } from "@/theme/tokens";

type StockRowProps = {
  stock: Stock;
  quote?: DataResource<MarketQuote>;
  onPress?: () => void;
};

export function StockRow({ stock, quote, onPress }: StockRowProps) {
  const resolved = quote?.status === "ready" || quote?.status === "stale" ? quote.data : null;
  const changePercent = resolved?.changePercent ?? null;
  const positive = (changePercent ?? 0) >= 0;
  const signedChange = changePercent === null ? "Unavailable" : `${positive ? "+" : ""}${changePercent.toFixed(2)}%`;
  const price = resolved ? formatPrice(resolved.price) : quote?.status === "loading" || !quote ? "Loading…" : "Unavailable";

  return (
    <Pressable
      accessibilityLabel={`${stock.name}, ${price}, ${signedChange} today`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <CompanyLogo color={stock.logoColor} name={stock.name} symbol={stock.symbol} />
      <View style={styles.identity}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text numberOfLines={1} style={styles.name}>{stock.name}</Text>
      </View>
      {resolved ? <Sparkline points={stock.trend} positive={positive} /> : <View style={styles.sparkPlaceholder} />}
      <View style={styles.valueWrap}>
        <Text style={styles.price}>{price}</Text>
        <View style={styles.changeRow}>
          {changePercent !== null ? <Ionicons color={positive ? colors.positive : colors.negative} name={positive ? "caret-up" : "caret-down"} size={10} /> : null}
          <Text style={[styles.change, { color: changePercent === null ? colors.textTertiary : positive ? colors.positive : colors.negative }]}>{signedChange.replace(/[+-]/, "")}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: 0.66,
  },
  identity: {
    flex: 1,
    minWidth: 62,
  },
  symbol: {
    ...typography.label,
    color: colors.textPrimary,
  },
  name: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  valueWrap: {
    minWidth: 72,
    alignItems: "flex-end",
  },
  price: {
    ...typography.label,
    color: colors.textPrimary,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  change: {
    ...typography.caption,
  },
  sparkPlaceholder: { width: 68 },
});
```

## ResourceStateNotice

- Path: `src/components/market/ResourceStateNotice.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DataResource } from "@/data/real";
import { formatFreshness } from "@/data/real";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function ResourceStateNotice<T>({ resource, onRetry }: { resource: DataResource<T> | undefined; onRetry?: () => void }) {
  if (!resource) return <Text style={styles.loading}>Loading verified data…</Text>;
  if (resource.status === "idle" || resource.status === "loading")
    return <Text style={styles.loading}>Loading verified data…</Text>;
  if (resource.status === "ready" || resource.status === "stale")
    return <Text style={[styles.freshness, resource.status === "stale" && styles.warning]}>{formatFreshness(resource.meta)} · {resource.meta.source}</Text>;
  return (
    <View style={styles.error}>
      <Text style={styles.errorText}>{resource.status === "rate-limited" ? "Provider rate limit reached." : "message" in resource ? resource.message : "Real data is unavailable."}</Text>
      {onRetry ? <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  loading: { ...typography.caption, color: colors.textTertiary },
  freshness: { ...typography.caption, color: colors.textTertiary },
  warning: { color: colors.warning },
  error: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: radii.md, backgroundColor: "#292317" },
  errorText: { ...typography.caption, flex: 1, color: colors.warning },
  retry: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.sm },
  retryText: { ...typography.label, color: colors.teal },
});
```

## DataFreshnessBadge

- Path: `src/components/stock/DataFreshnessBadge.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";
export function DataFreshnessBadge({
  label = "LOCAL DEMO · ILLUSTRATIVE",
}: {
  label?: string;
}) {
  return (
    <View accessibilityLabel={label} style={s.badge}>
      <Text style={s.text}>{label}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.tealMuted,
  },
  text: { ...typography.caption, color: colors.teal, letterSpacing: 0.7 },
});
```

## AppBottomSheet

- Path: `src/components/system/AppBottomSheet.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
/* eslint-disable react-hooks/immutability -- Reanimated shared values are intentionally mutable. */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radii, shadows, spacing, typography } from "@/theme/tokens";

const DISMISS_DISTANCE = 110;

type AppBottomSheetProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
}>;

export function AppBottomSheet({ visible, title, onClose, children }: AppBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(520);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 22, stiffness: 190 });
    } else {
      translateY.value = 520;
    }
  }, [translateY, visible]);

  const close = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > 900) {
        translateY.value = withSpring(520, { damping: 24, stiffness: 180 });
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 190 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal animationType="fade" onRequestClose={close} transparent visible={visible}>
      <View accessibilityViewIsModal style={styles.modal}>
        <Pressable accessibilityLabel="Close briefing" onPress={close} style={styles.backdrop} />
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }, animatedStyle]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={close} style={styles.closeButton}>
                <Ionicons color={colors.textSecondary} name="close" size={22} />
              </Pressable>
            </View>
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#000000A8",
  },
  sheet: {
    maxHeight: "82%",
    paddingHorizontal: spacing.lg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    ...shadows.floating,
  },
  handle: {
    width: 42,
    height: 5,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSoft,
  },
});
```

## EmptyState

- Path: `src/components/system/EmptyState.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/theme/tokens";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}><Ionicons color={colors.teal} name="leaf-outline" size={22} /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.tealMuted,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  action: {
    minHeight: 44,
    justifyContent: "center",
    marginTop: spacing.md,
  },
  actionText: {
    ...typography.label,
    color: colors.teal,
  },
});

```

## SkeletonState

- Path: `src/components/system/SkeletonState.tsx`
- Description: Shared MarketBrief mobile UI primitive used across primary product screens.
- Key props: See the exported TypeScript signatures in the complete source below.

```tsx
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import { colors, radii, spacing } from "@/theme/tokens";

export function SkeletonState() {
  const opacity = useSharedValue(0.38);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.78, { duration: 900 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View accessibilityLabel="Loading market briefing" accessibilityRole="progressbar" style={styles.container}>
      <Animated.View style={[styles.lineSmall, animatedStyle]} />
      <Animated.View style={[styles.lineLarge, animatedStyle]} />
      <Animated.View style={[styles.hero, animatedStyle]} />
      <View style={styles.row}>
        <Animated.View style={[styles.card, animatedStyle]} />
        <Animated.View style={[styles.card, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  lineSmall: {
    width: 108,
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSoft,
  },
  lineLarge: {
    width: 210,
    height: 30,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceSoft,
  },
  hero: {
    height: 310,
    marginTop: spacing.sm,
    borderRadius: radii.hero,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    height: 132,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
});

```
