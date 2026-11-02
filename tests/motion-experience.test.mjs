import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { motion } from "../src/theme/tokens.ts";
import { demoBarTimestamp } from "../src/data/real/demoTimeline.ts";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("illustrative chart timestamps cover their selected range without changing the fixed demo session", () => {
  const expectedSpans = { "1D": 6.5 * 3_600_000, "1W": 7 * 86_400_000, "1M": 30 * 86_400_000, "3M": 90 * 86_400_000, "1Y": 365 * 86_400_000 };
  for (const [range, span] of Object.entries(expectedSpans)) {
    const times = Array.from({ length: 8 }, (_, index) => Date.parse(demoBarTimestamp(range, index, 8)));
    assert.equal(times[7] - times[0], span);
    assert.ok(times.every((value, index) => index === 0 || value > times[index - 1]));
    assert.equal(new Date(times[7]).toISOString(), "2026-08-07T20:00:00.000Z");
    assert.equal(demoBarTimestamp(range, 0, 1), "2026-08-07T20:00:00.000Z");
  }
});

test("motion recipes stay bounded for fast tactile mobile interactions", () => {
  assert.ok(motion.press >= 80 && motion.press <= 180);
  assert.ok(motion.selection >= motion.press && motion.selection <= 300);
  assert.ok(motion.reveal >= motion.selection && motion.reveal <= 800);
  assert.ok(motion.settle.damping > 0 && motion.settle.stiffness > 0 && motion.settle.mass > 0);
});

test("shared motion preserves reduced-motion, cleanup and complete press callback state", async () => {
  for (const path of [
    "src/components/motion/MotionPressable.tsx",
    "src/components/motion/SelectionTrack.tsx",
    "src/components/foundation/Screen.tsx",
    "src/components/stock/PriceChart.tsx",
    "src/components/system/SkeletonState.tsx",
    "src/components/system/AppBottomSheet.tsx",
  ]) {
    const source = await read(path);
    assert.match(source, /useReducedMotion/, `${path} must respect reduced motion`);
    assert.match(source, /cancelAnimation/, `${path} must release its animations`);
  }
  const press = await read("src/components/motion/MotionPressable.tsx");
  assert.match(press, /style\(\{ pressed, hovered \}\)/);
  assert.match(press, /children\(\{ pressed, hovered \}\)/);
  for (const callback of ["onPressIn", "onPressOut", "onHoverIn", "onHoverOut"]) {
    assert.ok(press.includes(`${callback}?.(event)`), `${callback} must remain callable`);
  }
});

test("chart range narration and direction use plotted closes, not a newer daily quote", async () => {
  const stock = await read("src/app/stock/[symbol].tsx");
  assert.match(stock, /formatPrice\(firstChartPoint\.value\)/);
  assert.match(stock, /formatPrice\(lastChartPoint\.value\)/);
  assert.match(stock, /lastChartPoint\.value >= firstChartPoint\.value/);
  assert.match(stock, /positive=\{chartPositive\}/);
  assert.match(stock, /Latest quote daily change/);
  assert.match(stock, /year: range === "1Y" \? "2-digit" : undefined/);
  assert.doesNotMatch(stock, /Selected range ends at \$\{formatPrice\(quote\.price\)\}/);
});
