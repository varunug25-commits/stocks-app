# MarketBrief Mobile

MarketBrief is a native-first personal finance briefing experience built with Expo and React Native. Phase 2 Milestone 1 adds a polished, entirely local authentication and seven-step onboarding shell around the existing Today feed.

## Current scope

- splash, login, sign-up, forgot-password, and email-verification UI;
- complete seven-step onboarding with preserved selections;
- local persistence through AsyncStorage;
- reusable dark mobile foundations with haptics and Reanimated motion;
- realistic mock content only.

There is no real authentication, backend, Supabase, market API, OpenAI integration, payment flow, or push-notification request.

## Run locally

```bash
npm install
npm start
```

Use `a` for Android, `i` for an installed iOS Simulator, or `w` for the browser preview.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run doctor
```

Product, architecture, decisions, testing, and milestone evidence live in [`docs/`](docs/).
