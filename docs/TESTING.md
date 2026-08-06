# MarketBrief Testing

## Automated checks

- `npm run typecheck`: strict TypeScript compilation.
- `npm run lint`: Expo ESLint rules across `src` and `tests`.
- `npm test`: structure, integration guardrails, routes, accessibility markers, onboarding reducer behavior, duplicate prevention, five-stock ceiling, and completion state.
- `npm run doctor`: Expo dependency and configuration compatibility.

## Manual milestone matrix

Validate Splash, Login, Sign Up, Forgot Password, Email Verification, Welcome, Experience, Goals, Interests, Stocks, Notifications, Completion, and Today. Check forward and backward navigation, validation messages, social-provider demo feedback, offline preview, stock search, three-stock minimum, five-stock maximum, and persisted completion.

## Device evidence

Screenshots are stored in `docs/screenshots/phase-2-milestone-1/`. This Mac has no Xcode/iOS Simulator, and its only installed Android 37 Play Store image repeatedly causes a System UI ANR under the available 8 GB RAM. The committed evidence therefore uses the Expo web renderer at exact 393×852 iPhone and 412×915 Android viewports. Native screenshots remain a documented follow-up validation item rather than being misrepresented.

## Milestone 2 validation

- TypeScript, ESLint, 17 local tests, Expo Doctor, and a production web export are required before approval.
- Tests cover five tabs, Briefs, onboarding-selected Today stocks, dynamic date implementation, Markets modules, symbol/company search, empty results, forbidden integrations, accessibility, onboarding, and storage resilience.
- Responsive evidence uses exact web viewports: Android-sized 412 × 915 and iPhone reference 393 × 852.
- The iPhone set is layout reference only; native iPhone validation is not claimed.
- The user later performed native Android smoke testing on a real phone. Verified scope: app launch, Splash, mock Login, onboarding, stock selection, Today, Markets, Search, Watchlist, Briefs preview, Profile, and an overall good UI impression.
- That smoke test does not establish detailed performance, accessibility, low-memory, notification, payment, production, or native screenshot coverage. Native iPhone validation remains pending.
