export const EXPERIENCE_OPTIONS = ["New investor", "Intermediate", "Advanced", "Just exploring"] as const;
export const GOAL_OPTIONS = [
  "Understand daily moves", "Track stocks", "Follow earnings", "Read filings", "Get useful alerts", "Learn concepts", "Build long-term knowledge",
] as const;
export const INTEREST_OPTIONS = ["Technology", "AI", "Semiconductors", "Consumer", "Financials", "Healthcare", "Energy", "ETFs", "Macro"] as const;

export type Experience = (typeof EXPERIENCE_OPTIONS)[number];

export type MockStock = { symbol: string; name: string };
export const MOCK_STOCKS: MockStock[] = [
  { symbol: "AAPL", name: "Apple" }, { symbol: "MSFT", name: "Microsoft" }, { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "TSLA", name: "Tesla" }, { symbol: "AMZN", name: "Amazon" }, { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "META", name: "Meta Platforms" }, { symbol: "AMD", name: "Advanced Micro Devices" },
  { symbol: "PLTR", name: "Palantir" }, { symbol: "NFLX", name: "Netflix" },
];

export type OnboardingState = {
  experience: Experience | null;
  goals: string[];
  interests: string[];
  stocks: string[];
  notificationsEnabled: boolean;
  completed: boolean;
};

export const initialOnboardingState: OnboardingState = {
  experience: null, goals: [], interests: [], stocks: [], notificationsEnabled: false, completed: false,
};

function isUniqueSubset(values: unknown, allowed: readonly string[], limit?: number): values is string[] {
  if (!Array.isArray(values) || !values.every((value) => typeof value === "string" && allowed.includes(value))) return false;
  if (new Set(values).size !== values.length) return false;
  return limit === undefined || values.length <= limit;
}

export function isOnboardingState(value: unknown): value is OnboardingState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  const allowedExperiences: readonly unknown[] = [null, ...EXPERIENCE_OPTIONS];
  return allowedExperiences.includes(candidate.experience)
    && isUniqueSubset(candidate.goals, GOAL_OPTIONS)
    && isUniqueSubset(candidate.interests, INTEREST_OPTIONS)
    && isUniqueSubset(candidate.stocks, MOCK_STOCKS.map((stock) => stock.symbol), 15)
    && typeof candidate.notificationsEnabled === "boolean"
    && typeof candidate.completed === "boolean";
}

export type OnboardingAction =
  | { type: "hydrate"; value: OnboardingState }
  | { type: "experience"; value: Experience }
  | { type: "toggleGoal"; value: string }
  | { type: "toggleInterest"; value: string }
  | { type: "toggleStock"; value: string }
  | { type: "notifications"; value: boolean }
  | { type: "complete" };

export function toggleUnique(values: string[], value: string, limit?: number) {
  if (values.includes(value)) return values.filter((item) => item !== value);
  if (limit && values.length >= limit) return values;
  return [...values, value];
}

export function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "hydrate": return action.value;
    case "experience": return { ...state, experience: action.value };
    case "toggleGoal": return { ...state, goals: toggleUnique(state.goals, action.value) };
    case "toggleInterest": return { ...state, interests: toggleUnique(state.interests, action.value) };
    case "toggleStock": return { ...state, stocks: toggleUnique(state.stocks, action.value, 15) };
    case "notifications": return { ...state, notificationsEnabled: action.value };
    case "complete": return { ...state, completed: true };
  }
}
