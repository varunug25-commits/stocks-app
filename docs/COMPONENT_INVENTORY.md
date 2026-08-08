# MarketBrief Mobile Component Inventory

## Phase 2 Milestone 1 additions

- `AppScreen`: safe-area, scrolling, padding, and keyboard-aware screen frame.
- `AppHeader`: native back/action header.
- `PrimaryButton`, `SecondaryButton`, `TextButton`, `IconButton`: 44+ point actions with state feedback.
- `FormField`, `PasswordField`: accessible input, focus, validation, and visibility controls.
- `SelectionCard`, `MultiSelectChip`, `ProgressIndicator`: onboarding decisions and progress.
- `AuthProviderButton`: honest mock Apple/Google actions.
- `InlineError`, `LoadingOverlay`, `ErrorState`, `OfflineBanner`, `ConfirmationModal`, `DemoDataBadge`: reusable system states.
- `LogoMark`: temporary original MarketBrief mark and wordmark.
- `BottomSheet`: stable export for the existing gesture-driven sheet.
- `AuthScaffold`, `OnboardingScaffold`: consistent mobile layouts for their respective flows.

## Foundation

| Component | Responsibility | First-phase status |
| --- | --- | --- |
| `Screen` | Safe-area-aware screen container | Build |
| `SectionHeader` | Title, eyebrow, and optional action | Build |
| `IconButton` | Accessible 44 pt icon action | Build |
| `Pill` | Compact semantic status | Build |
| `Sparkline` | Decorative trend visualization with text summary | Build |

## Finance content

| Component | Responsibility | First-phase status |
| --- | --- | --- |
| `CompanyLogo` | Consistent company identity with safe local fallback | Build |
| `MarketIndexCard` | Index value, movement, and session state | Build |
| `StockRow` | Company, price, change, and compact trend | Build |
| `EditorialHero` | Lead story with strong imagery and metadata | Build |
| `StoryCard` | Compact story item for horizontal rails | Build |
| `AIBriefingCard` | Clearly labeled mock briefing summary | Build |
| `EventCard` | Earnings or macro event with timing | Build |
| `SourceCitation` | Source, timestamp, and optional link affordance | Build |

## System states and overlays

| Component | Responsibility | First-phase status |
| --- | --- | --- |
| `EmptyState` | Explain missing content and next action | Build |
| `SkeletonState` | Layout-preserving loading placeholder | Build |
| `AppBottomSheet` | Native-feeling progressive disclosure | Build |
| `SubscriptionPaywall` | Reusable future upgrade surface with mock behavior | Build, not routed |

## Component rules

- Components accept data through typed props and contain no API calls.
- Components do not read authentication or global user state.
- Finance values include accessible spoken labels.
- Pressable components expose pressed and disabled states.
- Shared tokens are imported from one theme module.
- Platform differences are intentional and minimal.

## Milestone 2 additions

- Navigation: `BottomTabBar`.
- Markets: `MarketStatusBadge`, `SectorPerformanceCard`, `MarketMoverRow`, `FilterChip`, `MarketMoodCard`, `TimestampLabel`, `EarningsEventCard`, `EconomicEventCard`, and `MarketClosedState`.
- Search: `SearchField` and `SearchResultRow`.
- Shared states reused: `DemoDataBadge`, `OfflineBanner`, `ErrorState`, `EmptyState`, `SkeletonState`, and `AppBottomSheet`.

These components preserve 44-point minimum interaction targets, accessible labels, and text/icon direction cues rather than relying on colour alone.

## Milestone 3 additions

- Stock identity and action: `StockHeader`, `WatchlistButton`, `PriceMovement`, and `StockActionSheet`.
- Chart: `PriceChart`, `ChartRangeSelector`, and `DataFreshnessBadge`.
- Explanation: `WhyItMovedCard`, `DriverRow`, `InterpretationCard`, `ConfidenceIndicator`, and `SourceList`.
- Research: `CatalystCard`, `MarketStatsGrid`, `FilingRow`, and `StoryRow`.
- Watchlist management: `WatchlistRow` and `WatchlistLimitSheet`.

All accept typed local data. The chart exposes a spoken summary, watchlist actions provide button-based remove/reorder alternatives, and sources distinguish evidence from interpretation.

## Milestone 4 additions

- Brief identity/navigation: `BriefHeroCard`, `BriefTypeSelector`, `BriefStatusBadge`, and `BriefHistoryRow`.
- Personalization/content: `BriefSummaryPoint`, `BriefMarketContext`, `BriefStockImpactRow`, and `BriefEventRow`.
- Evidence/actions: `BriefEvidenceCard`, `SaveBriefButton`, `ShareBriefButton`, and `BriefEmptyState`.
- Progressive controls: `BriefFilterSheet` using the existing native-feeling bottom-sheet foundation.

The components accept typed generated local content, retain 44-point actions and accessible labels, and do not call storage, APIs, AI providers, or payment services directly.

## Milestone 7 additions

- `AskMarketBriefEntry`: restrained contextual entry row; never a bottom tab.
- `IntelligencePanel`: typed confirmed, interpretation, uncertainty, and catalyst bullets.
- `CitationSheet`: evidence metadata and original provider URLs.
- `IntelligenceSkeleton`: compact module-only loading state.
- `IntelligenceProvider`: shared request state with REAL/DEMO separation and in-flight protection.

Display components receive typed resources and do not call model vendors. The client provider calls only the MarketBrief server endpoint.
