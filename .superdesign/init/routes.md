# Route Map

Framework: Expo Router 57 with file-based React Native routes. Root stack is defined in `src/app/_layout.tsx`; primary tabs are defined in `src/app/(tabs)/_layout.tsx`.

| URL | Entry file | Layout | Purpose |
| --- | --- | --- | --- |
| `/` | `src/app/(tabs)/index.tsx` | Root stack → five-tab layout | Personalized Today feed |
| `/markets` | `src/app/(tabs)/markets.tsx` | Root stack → five-tab layout | Market overview and supported market context |
| `/watchlist` | `src/app/(tabs)/watchlist.tsx` | Root stack → five-tab layout | Persistent shared watchlist |
| `/briefs` | `src/app/(tabs)/briefs.tsx` | Root stack → five-tab layout | Morning/evening brief publication home |
| `/profile` | `src/app/(tabs)/profile.tsx` | Root stack → five-tab layout | Personalization and settings summary |
| `/stock/[symbol]` | `src/app/stock/[symbol].tsx` | Root stack | Stock detail with real quote, bars, events, news and filings |
| `/stock/[symbol]/why` | `src/app/stock/[symbol]/why.tsx` | Root stack | Expanded illustrative why-it-moved evidence |
| `/brief/[briefId]` | `src/app/brief/[briefId].tsx` | Root stack | Editorial brief detail |
| `/search` | `src/app/search.tsx` | Root stack | Stock search and watchlist actions |
| `/splash` | `src/app/splash.tsx` | Root stack | Safe hydration and route resolution |
| `/login` | `src/app/(auth)/login.tsx` | Auth stack | Local demo login shell |
| `/sign-up` | `src/app/(auth)/sign-up.tsx` | Auth stack | Local demo sign-up shell |
| `/forgot-password` | `src/app/(auth)/forgot-password.tsx` | Auth stack | Local demo recovery shell |
| `/verify-email` | `src/app/(auth)/verify-email.tsx` | Auth stack | Local demo verification shell |
| `/welcome` | `src/app/(onboarding)/welcome.tsx` | Onboarding stack | Onboarding introduction |
| `/experience` | `src/app/(onboarding)/experience.tsx` | Onboarding stack | Investor experience selection |
| `/goals` | `src/app/(onboarding)/goals.tsx` | Onboarding stack | Goal selection |
| `/interests` | `src/app/(onboarding)/interests.tsx` | Onboarding stack | Interest selection |
| `/stocks` | `src/app/(onboarding)/stocks.tsx` | Onboarding stack | Initial watchlist selection |
| `/notifications` | `src/app/(onboarding)/notifications.tsx` | Onboarding stack | Local notification preference |
| `/complete` | `src/app/(onboarding)/complete.tsx` | Onboarding stack | Onboarding summary |

## Router source

See complete root and tab layout source in `.superdesign/init/layouts.md`.
