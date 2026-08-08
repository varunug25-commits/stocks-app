# Key Page Dependency Trees

Trees prioritize all local files with visual or product-state impact. Repeated data-contract and storage leaves are collapsed after their first meaningful UI consumer to keep this discovery map bounded.

## / — Today
Entry: `src/app/(tabs)/index.tsx`
Dependencies:
- `src/components/finance/AIBriefingCard.tsx`
- `src/components/finance/EditorialHero.tsx`
  - `src/components/finance/EditorialArtwork.tsx`
  - `src/components/finance/SourceCitation.tsx`
- `src/components/finance/EventCard.tsx`
- `src/components/finance/MarketIndexCard.tsx`
  - `src/components/finance/Sparkline.tsx`
- `src/components/finance/StockRow.tsx`
  - `src/components/finance/CompanyLogo.tsx`
  - `src/components/finance/Sparkline.tsx`
- `src/components/finance/StoryCard.tsx`
- `src/components/foundation/IconButton.tsx`
- `src/components/foundation/Feedback.tsx`
  - `src/components/foundation/Buttons.tsx`
- `src/components/foundation/Screen.tsx`
- `src/components/foundation/SectionHeader.tsx`
- `src/components/market/DataModeBanner.tsx`
- `src/components/market/MarketClosedState.tsx`
- `src/components/market/MarketStatusBadge.tsx`
- `src/components/market/ResourceStateNotice.tsx`
- `src/components/market/TimestampLabel.tsx`
- `src/components/system/EmptyState.tsx`
- `src/components/system/SkeletonState.tsx`
- `src/features/market-data/MarketDataProvider.tsx`
- `src/features/watchlist/WatchlistProvider.tsx`
  - `src/features/watchlist/todayStocks.ts`
- `src/features/onboarding/OnboardingProvider.tsx`
- `src/data/today.ts`
- `src/data/markets.ts`
- `src/data/briefs/index.ts`
- `src/theme/tokens.ts`
## /markets — Markets
Entry: `src/app/(tabs)/markets.tsx`
Dependencies:
- `src/components/finance/MarketIndexCard.tsx`
  - `src/components/finance/Sparkline.tsx`
- `src/components/foundation/Feedback.tsx`
- `src/components/foundation/Screen.tsx`
- `src/components/foundation/SectionHeader.tsx`
- `src/components/market/DataModeBanner.tsx`
- `src/components/market/EarningsEventCard.tsx`
- `src/components/market/EconomicEventCard.tsx`
- `src/components/market/FilterChip.tsx`
- `src/components/market/MarketMoodCard.tsx`
- `src/components/market/MarketMoverRow.tsx`
- `src/components/market/MarketStatusBadge.tsx`
- `src/components/market/ResourceStateNotice.tsx`
- `src/components/market/SectorPerformanceCard.tsx`
- `src/components/market/TimestampLabel.tsx`
- `src/components/system/AppBottomSheet.tsx`
- `src/data/markets.ts`
- `src/features/market-data/MarketDataProvider.tsx`
- `src/theme/tokens.ts`

## /watchlist — Watchlist
Entry: `src/app/(tabs)/watchlist.tsx`
Dependencies:
- `src/components/foundation/Screen.tsx`
- `src/components/market/DataModeBanner.tsx`
- `src/components/market/ResourceStateNotice.tsx`
- `src/components/stock/WatchlistLimitSheet.tsx`
  - `src/components/system/AppBottomSheet.tsx`
- `src/components/stock/WatchlistRow.tsx`
  - `src/components/finance/CompanyLogo.tsx`
  - `src/components/finance/Sparkline.tsx`
- `src/components/system/EmptyState.tsx`
- `src/components/system/SkeletonState.tsx`
- `src/features/market-data/MarketDataProvider.tsx`
- `src/features/watchlist/WatchlistProvider.tsx`
- `src/data/stocks/index.ts`
- `src/theme/tokens.ts`

## /briefs — Briefs
Entry: `src/app/(tabs)/briefs.tsx`
Dependencies:
- `src/components/foundation/Screen.tsx`
- `src/components/foundation/SectionHeader.tsx`
- `src/components/system/SkeletonState.tsx`
- `src/features/briefs/BriefsProvider.tsx`
- `src/features/watchlist/WatchlistProvider.tsx`
- `src/data/briefs/index.ts`
- `src/theme/tokens.ts`

## /brief/[briefId] — Brief Detail
Entry: `src/app/brief/[briefId].tsx`
Dependencies:
- `src/components/foundation/Feedback.tsx`
- `src/components/foundation/Screen.tsx`
- `src/components/foundation/SectionHeader.tsx`
- `src/components/system/EmptyState.tsx`
- `src/components/system/SkeletonState.tsx`
- `src/features/briefs/BriefsProvider.tsx`
- `src/features/briefs/selectors.ts`
- `src/features/watchlist/WatchlistProvider.tsx`
- `src/data/briefs/index.ts`
- `src/theme/tokens.ts`

## /stock/[symbol] — Stock Detail
Entry: `src/app/stock/[symbol].tsx`
Dependencies:
- `src/components/foundation/Feedback.tsx`
- `src/components/foundation/Screen.tsx`
- `src/components/foundation/SectionHeader.tsx`
- `src/components/market/DataModeBanner.tsx`
- `src/components/market/ResourceStateNotice.tsx`
- `src/components/stock/CatalystCard.tsx`
- `src/components/stock/ChartRangeSelector.tsx`
- `src/components/stock/DataFreshnessBadge.tsx`
- `src/components/stock/FilingRow.tsx`
- `src/components/stock/MarketStatsGrid.tsx`
- `src/components/stock/PriceChart.tsx`
- `src/components/stock/PriceMovement.tsx`
- `src/components/stock/SourceList.tsx`
- `src/components/stock/StockHeader.tsx`
  - `src/components/finance/CompanyLogo.tsx`
  - `src/components/stock/WatchlistButton.tsx`
- `src/components/stock/StoryRow.tsx`
- `src/components/stock/WatchlistLimitSheet.tsx`
- `src/components/stock/WhyItMovedCard.tsx`
- `src/components/system/EmptyState.tsx`
- `src/components/system/SkeletonState.tsx`
- `src/data/real/index.ts`
- `src/features/market-data/MarketDataProvider.tsx`
- `src/features/watchlist/WatchlistProvider.tsx`
- `src/theme/tokens.ts`

## /profile — Profile
Entry: `src/app/(tabs)/profile.tsx`
Dependencies:
- `src/components/foundation/Feedback.tsx`
- `src/components/foundation/Screen.tsx`
- `src/features/onboarding/OnboardingProvider.tsx`
- `src/features/watchlist/WatchlistProvider.tsx`
- `src/theme/tokens.ts`

## Shared shell
- `src/app/_layout.tsx`
- `src/app/(tabs)/_layout.tsx`
- `src/components/navigation/BottomTabBar.tsx`
- `src/theme/tokens.ts`
