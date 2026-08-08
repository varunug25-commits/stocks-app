# Extractable Superdesign Components

## Layout Components

## BottomTabBar
- Source: `src/components/navigation/BottomTabBar.tsx`
- Category: layout
- Description: Five-item native bottom navigation shared by all primary screens.
- Extractable props: `activeItem` (string, default: "Today")
- Hardcoded: five information-architecture labels, Ionicon identities, compact tab layout, safe-area behavior.

## AppHeader
- Source: `src/components/foundation/AppHeader.tsx`
- Category: layout
- Description: Compact title/header row with optional back and text action.
- Extractable props: `title`, `back`, `actionLabel`
- Hardcoded: navigation icon treatment, sizing and typography.

## Basic Components

## SectionHeader
- Source: `src/components/foundation/SectionHeader.tsx`
- Category: basic
- Description: Section title with optional eyebrow and action.
- Extractable props: `eyebrow`, `title`, `actionLabel`
- Hardcoded: type hierarchy and alignment.

## StockRow
- Source: `src/components/finance/StockRow.tsx`
- Category: basic
- Description: Compact watchlist quote row with identity, sparkline, price and semantic change.
- Extractable props: `symbol`, `name`, `price`, `changePercent`, `positive`
- Hardcoded: logo position, financial number alignment, red/green semantics.

## ResourceStateNotice
- Source: `src/components/market/ResourceStateNotice.tsx`
- Category: basic
- Description: Local loading, freshness, stale and retry status for one provider resource.
- Extractable props: `status`, `freshnessLabel`, `source`, `retryVisible`
- Hardcoded: truthful local-state placement and warning semantics.

## AppBottomSheet
- Source: `src/components/system/AppBottomSheet.tsx`
- Category: basic
- Description: Gesture-dismissible native-feeling bottom sheet.
- Extractable props: `visible`, `title`
- Hardcoded: drag handle, close control, safe area, motion.

## EmptyState
- Source: `src/components/system/EmptyState.tsx`
- Category: basic
- Description: Accessible zero-data state with optional action.
- Extractable props: `title`, `description`, `actionLabel`
- Hardcoded: icon and centered structure.

## DataFreshnessBadge
- Source: `src/components/stock/DataFreshnessBadge.tsx`
- Category: basic
- Description: Compact source/freshness label used in Stock Detail.
- Extractable props: `label`
- Hardcoded: compact metadata treatment.

## BriefTypeSelector
- Source: `src/components/briefs/BriefTypeSelector.tsx`
- Category: basic
- Description: Morning/evening segmented selector.
- Extractable props: `selectedType`
- Hardcoded: Morning and Evening labels.

## CompanyLogo
- Source: `src/components/finance/CompanyLogo.tsx`
- Category: basic
- Description: Company identity mark with accessible fallback monogram.
- Extractable props: `name`, `symbol`, `color`
- Hardcoded: fallback lettering logic and compact geometry.
