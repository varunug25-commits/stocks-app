import assert from "node:assert/strict";
import test from "node:test";
import { initialOnboardingState, onboardingReducer, toggleUnique } from "../src/features/onboarding/model.ts";

test("onboarding steps preserve earlier decisions", () => {
  let state = onboardingReducer(initialOnboardingState, { type: "experience", value: "Intermediate" });
  state = onboardingReducer(state, { type: "toggleGoal", value: "Track stocks" });
  state = onboardingReducer(state, { type: "toggleInterest", value: "AI" });
  assert.equal(state.experience, "Intermediate");
  assert.deepEqual(state.goals, ["Track stocks"]);
  assert.deepEqual(state.interests, ["AI"]);
});

test("stock selection prevents duplicates and enforces the five-stock ceiling", () => {
  const selected = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN"];
  assert.deepEqual(toggleUnique(["AAPL"], "AAPL", 5), []);
  assert.deepEqual(toggleUnique(selected, "GOOGL", 5), selected);
});

test("completion produces a persisted-ready state", () => {
  const state = onboardingReducer({ ...initialOnboardingState, stocks: ["AAPL", "MSFT", "NVDA"] }, { type: "complete" });
  assert.equal(state.completed, true);
});
