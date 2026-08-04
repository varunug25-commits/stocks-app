import { useRouter } from "expo-router";
import { PrimaryButton } from "@/components/foundation/Buttons";
import { SelectionCard } from "@/components/foundation/Selections";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import { EXPERIENCE_OPTIONS } from "@/features/onboarding/model";
import type { Experience } from "@/features/onboarding/model";
import { OnboardingScaffold } from "@/components/onboarding/OnboardingScaffold";
const descriptions: Record<Experience, string> = { "New investor": "I’m learning the foundations", Intermediate: "I follow markets regularly", Advanced: "I’m comfortable with detailed analysis", "Just exploring": "Show me what MarketBrief can do" };
export default function ExperienceScreen() { const router = useRouter(); const { state, dispatch } = useOnboarding(); return <OnboardingScaffold description="We’ll tune the level of detail in your demo brief." footer={<PrimaryButton disabled={!state.experience} label="Continue" onPress={() => router.push("/(onboarding)/goals")} />} step={2} title="How familiar are you with investing?">{EXPERIENCE_OPTIONS.map((option) => <SelectionCard description={descriptions[option]} key={option} label={option} onPress={() => dispatch({ type: "experience", value: option })} selected={state.experience === option} />)}</OnboardingScaffold>; }
