# Signal Mobile

Signal is a native-first market companion built with Expo and React Native. The current phase is a polished, local-data design shell for iPhone and Android.

## Current scope

- Expo Router application foundation
- dark mobile design system
- bottom tab navigation
- polished Today feed using local mock data
- reusable finance and system-state components

Authentication, real APIs, databases, Supabase, and AI calls are intentionally excluded.

## Run locally

Requirements: Node.js 22 or newer and the Expo Go app, an iOS simulator, or an Android emulator.

```bash
npm install
npm start
```

Then scan the QR code with Expo Go or press `i` for iOS / `a` for Android.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run doctor
```

Product and design decisions live in [`docs/`](./docs/).
