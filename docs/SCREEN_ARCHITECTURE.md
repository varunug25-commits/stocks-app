# MarketBrief Mobile Screen Architecture

## Phase 2 Milestone 1 route map

- Root stack: Splash, Auth group, Onboarding group, existing Tabs group.
- Auth group: Login, Sign Up, Forgot Password, Email Verification.
- Onboarding group: Welcome, Experience, Goals, Interests, Stocks, Notifications, Completion.
- Existing tabs remain Today, Markets, Watchlist, and Profile; this milestone does not expand them.

Splash resolves only local state. Auth screens create no real identity. The onboarding provider sits above every route so back navigation preserves decisions, while typed storage helpers persist the completed profile separately from UI code.

## Navigation model

The app uses four persistent bottom tabs:

1. **Today** — personalized market briefing and watchlist movement
2. **Markets** — indices, sectors, movers, and discovery
3. **Watchlist** — saved companies and alerts
4. **Profile** — preferences, subscription, and app information

The first phase fully implements Today. Other tabs provide polished, honest placeholders so navigation can be evaluated without implying finished features.

## Route map

```text
Root stack
├── (tabs)
│   ├── index              Today
│   ├── markets            Markets placeholder
│   ├── watchlist          Watchlist placeholder
│   └── profile            Profile placeholder
├── stock/[symbol]         Future stock detail
├── story/[id]             Future story reader
└── paywall                Future subscription modal
```

Only routes needed for the current shell should be created. Future routes stay documented until their implementation phase.

## Today screen hierarchy

1. Safe-area header
   - greeting and current session label
   - notification action
2. Market pulse carousel
   - major index cards
   - open/closed market context
3. Editorial hero
   - single lead story with licensed/original image placeholder treatment
   - source and reading time
4. AI briefing card
   - clearly labeled mock summary
   - three high-signal takeaways
   - opens a native-feeling bottom sheet
5. Watchlist movers
   - logo, company, live-looking mock price, daily change, sparkline
6. Upcoming events
   - earnings and macro events
7. More stories carousel
   - compact editorial story cards
8. Informational disclaimer

## Information disclosure

- Screen: summary and priority
- Bottom sheet: explanation and supporting detail
- Detail screen: complete company or story context in a later phase

Filters are never permanently visible. When introduced, they should live in chips, menus, or bottom sheets.

## State model

Every data-driven section must support:

- loaded mock state;
- skeleton state;
- empty state; and
- refresh state.

The first phase demonstrates these primitives locally. No network state or persistence is added.

## Milestone 2 route architecture

- `/(tabs)` owns the five-tab mobile navigation shell.
- `/` is Today; `/markets`, `/watchlist`, `/briefs`, and `/profile` are tab routes.
- `/search` is a root-stack route reachable from Markets and Watchlist.
- Today preview query states support loading, offline, closed, empty, and error design review.

All Milestone 2 market and search content comes from local typed modules and the existing onboarding provider.

## Milestone 3 route architecture

- `/stock/[symbol]` is a root-stack Stock Detail route reached from Today, Search, and Watchlist.
- `/stock/[symbol]/why` progressively discloses the full Why It Moved evidence model.
- `/search` owns recent/trending discovery and direct watchlist actions.
- `/watchlist` owns add, remove, reorder, compact/expanded rows, and limit recovery.

`WatchlistProvider` is the single source of truth for saved symbols, recent searches, per-symbol chart ranges, and dismissed notices. It validates persisted JSON and performs a one-time migration from onboarding stock choices. Typed modules under `src/data/stocks/` provide companies, prices, charts, statistics, insights, content, and sources without network calls.

## Milestone 4 route architecture

- `/briefs` is the tab-owned Briefs home with Morning/Evening selection, the latest edition, history, saved/unread/type filters, and honest failure states. It intentionally has no pull-to-refresh while editions remain deterministic local fixtures.
- `/brief/[briefId]` is a root-stack long-form Brief Detail route with correct back navigation and progressive sections.
- Today generates the same latest Morning Brief identity and opens `/brief/[briefId]`; no duplicate Today briefing sheet remains.
- Stock-impact rows route to the existing `/stock/[symbol]` detail.

`BriefsProvider` owns validated, persisted read IDs, saved IDs, selected type, history filters, and dismissed notices. The deterministic generator under `src/data/briefs/` combines typed local templates, stock content, events, filings, and sources with `WatchlistProvider.state.symbols` in its stored order. Onboarding remains an initial migration input only, never active brief membership.

## Milestone 7 grounded-intelligence architecture

- `/stock/[symbol]/why` is the expanded source-linked Why It Moved view.
- `/ask` handles stock/watchlist questions, relevant-news quick reads, and filing summaries.
- `/brief/[briefId]` renders a grounded REAL-mode edition and preserves the illustrative DEMO edition.
- Ask entry points live on Today, Stock Detail, and Brief Detail. Ask is intentionally not a sixth tab.

All four capabilities share `IntelligenceProvider` in the mobile shell and the server-side `market-intelligence` evidence engine. Intelligence resource state is isolated, so an explanation failure cannot replace quote, chart, news, filing, or event state.
