# MarketBrief Testing

## Automated checks

- `npm run typecheck`: strict TypeScript compilation.
- `npm run lint`: Expo ESLint rules across `src` and `tests`.
- `npm test`: structure, integration guardrails, routes, accessibility markers, onboarding reducer behavior, duplicate prevention, five-stock ceiling, and completion state.
- `npm run doctor`: Expo dependency and configuration compatibility.

## Manual milestone matrix

Validate Splash, Login, Sign Up, Forgot Password, Email Verification, Welcome, Experience, Goals, Interests, Stocks, Notifications, Completion, and Today. Check forward and backward navigation, validation messages, social-provider demo feedback, offline preview, stock search, three-stock minimum, five-stock maximum, and persisted completion.

## Device evidence

Screenshots are stored in `docs/screenshots/phase-2-milestone-1/`. Android evidence is captured from the configured Android emulator. iPhone-size evidence uses the Expo web renderer at an iPhone viewport when Xcode/iOS Simulator is unavailable on the development Mac; this limitation is recorded in the milestone report and pull request.
