import type { OnboardingState } from "../onboarding/model.ts";

export type SplashRoute = "/(tabs)" | "/(auth)/login";

type SplashLoaders = {
  loadSession: () => Promise<boolean>;
  loadOnboarding: () => Promise<OnboardingState | null>;
};

export async function resolveSplashRoute({ loadSession, loadOnboarding }: SplashLoaders): Promise<SplashRoute> {
  try {
    const [session, onboarding] = await Promise.all([loadSession(), loadOnboarding()]);
    return session && onboarding?.completed ? "/(tabs)" : "/(auth)/login";
  } catch {
    return "/(auth)/login";
  }
}
