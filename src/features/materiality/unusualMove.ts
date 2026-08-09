import type { PriceBar } from "@/data/real";

export type MoveLabel = "NORMAL RANGE" | "ELEVATED MOVE" | "UNUSUAL MOVE";
export type PriceContext = {
  dailyMovePercent: number | null;
  fiveSessionMovePercent: number | null;
  periodMovePercent: number | null;
  recentHigh: number | null;
  recentLow: number | null;
  medianAbsoluteDailyMove: number | null;
  unusualMoveRatio: number | null;
  label: MoveLabel | null;
  validSessions: number;
};

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

const percentMove = (start: number, end: number) => start > 0 ? ((end / start) - 1) * 100 : null;

export function classifyMove(ratio: number | null): MoveLabel | null {
  if (ratio === null || !Number.isFinite(ratio)) return null;
  if (ratio >= 2) return "UNUSUAL MOVE";
  if (ratio >= 1.35) return "ELEVATED MOVE";
  return "NORMAL RANGE";
}

export function calculatePriceContext(bars: PriceBar[], quoteMovePercent: number | null): PriceContext {
  const valid = bars
    .filter((bar) => Number.isFinite(Date.parse(bar.timestamp)) && Number.isFinite(bar.close) && bar.close > 0 && Number.isFinite(bar.high) && Number.isFinite(bar.low))
    .sort((left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp));
  if (valid.length < 2) return {
    dailyMovePercent: quoteMovePercent,
    fiveSessionMovePercent: null,
    periodMovePercent: null,
    recentHigh: null,
    recentLow: null,
    medianAbsoluteDailyMove: null,
    unusualMoveRatio: null,
    label: null,
    validSessions: valid.length,
  };
  const last = valid.at(-1)!;
  const fiveStart = valid[Math.max(0, valid.length - 6)]!;
  const dailyMoves = valid.slice(1).map((bar, index) => Math.abs(percentMove(valid[index]!.close, bar.close) ?? 0)).filter(Number.isFinite);
  const typical = median(dailyMoves.slice(-20));
  const ratio = quoteMovePercent !== null && typical !== null && typical > 0 ? Math.abs(quoteMovePercent) / typical : null;
  return {
    dailyMovePercent: quoteMovePercent,
    fiveSessionMovePercent: percentMove(fiveStart.close, last.close),
    periodMovePercent: percentMove(valid[0]!.close, last.close),
    recentHigh: Math.max(...valid.map((bar) => bar.high)),
    recentLow: Math.min(...valid.map((bar) => bar.low)),
    medianAbsoluteDailyMove: typical,
    unusualMoveRatio: ratio,
    label: classifyMove(ratio),
    validSessions: valid.length,
  };
}
