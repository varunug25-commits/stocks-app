# Signal Mobile Screen Architecture

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

