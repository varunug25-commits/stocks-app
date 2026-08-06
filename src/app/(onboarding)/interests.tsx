import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { PrimaryButton } from "@/components/foundation/Buttons";
import { MultiSelectChip } from "@/components/foundation/Selections";
import { OnboardingScaffold } from "@/components/onboarding/OnboardingScaffold";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import { INTEREST_OPTIONS } from "@/features/onboarding/model";
export default function InterestsScreen() { const router = useRouter(); const { state, dispatch } = useOnboarding(); return <OnboardingScaffold description="Choose the sectors and themes you want surfaced first." footer={<PrimaryButton disabled={!state.interests.length} label="Continue" onPress={() => router.push("/(onboarding)/stocks")} />} step={4} title="What catches your attention?"><View style={styles.wrap}>{INTEREST_OPTIONS.map((item) => <MultiSelectChip key={item} label={item} onPress={() => dispatch({ type: "toggleInterest", value: item })} selected={state.interests.includes(item)} />)}</View></OnboardingScaffold>; }
const styles = StyleSheet.create({ wrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 } });
