import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { PrimaryButton } from "@/components/foundation/Buttons";
import { MultiSelectChip } from "@/components/foundation/Selections";
import { OnboardingScaffold } from "@/components/onboarding/OnboardingScaffold";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import { GOAL_OPTIONS } from "@/features/onboarding/model";
export default function GoalsScreen() { const router = useRouter(); const { state, dispatch } = useOnboarding(); return <OnboardingScaffold description="Pick as many as you like. You can change these later." footer={<PrimaryButton disabled={!state.goals.length} label="Continue" onPress={() => router.push("/(onboarding)/interests")} />} step={3} title="What do you want help with?"><View style={styles.wrap}>{GOAL_OPTIONS.map((goal) => <MultiSelectChip key={goal} label={goal} onPress={() => dispatch({ type: "toggleGoal", value: goal })} selected={state.goals.includes(goal)} />)}</View></OnboardingScaffold>; }
const styles = StyleSheet.create({ wrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 } });
