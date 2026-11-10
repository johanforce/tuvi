import type { XsmbDraw } from '../services/xsmb.js';

export interface XsmbNumberStat {
  number: string;
  lotoOccurrences: number;
  lotoHitDays: number;
  lotoRate: number;
  deOccurrences: number;
  deRate: number;
  lastLotoDate: string | null;
  lastDeDate: string | null;
}

export interface XsmbStats {
  drawCount: number;
  totalLotoOccurrences: number;
  numbers: XsmbNumberStat[];
  topLoto: XsmbNumberStat[];
  topDe: XsmbNumberStat[];
  averageLotoOccurrencesPerDraw: number;
}

export interface FrequencyBacktest {
  windowSize: number;
  bets: number;
  hits: number;
  hitRate: number | null;
}

const ALL_NUMBERS = Array.from({ length: 100 }, (_, index) => String(index).padStart(2, '0'));

export function calculateXsmbStats(draws: XsmbDraw[]): XsmbStats {
  const lotoOccurrences = new Map(ALL_NUMBERS.map(number => [number, 0]));
  const lotoHitDays = new Map(ALL_NUMBERS.map(number => [number, 0]));
  const deOccurrences = new Map(ALL_NUMBERS.map(number => [number, 0]));
  const lastLotoDate = new Map<string, string>();
  const lastDeDate = new Map<string, string>();
  let totalLotoOccurrences = 0;

  for (const draw of draws) {
    deOccurrences.set(draw.special, (deOccurrences.get(draw.special) ?? 0) + 1);
    lastDeDate.set(draw.special, draw.date);
    const seenToday = new Set(draw.loto);
    for (const number of draw.loto) {
      lotoOccurrences.set(number, (lotoOccurrences.get(number) ?? 0) + 1);
      totalLotoOccurrences++;
      lastLotoDate.set(number, draw.date);
    }
    for (const number of seenToday) {
      lotoHitDays.set(number, (lotoHitDays.get(number) ?? 0) + 1);
    }
  }

  const drawCount = draws.length;
  const numbers = ALL_NUMBERS.map(number => ({
    number,
    lotoOccurrences: lotoOccurrences.get(number) ?? 0,
    lotoHitDays: lotoHitDays.get(number) ?? 0,
    lotoRate: drawCount ? ((lotoHitDays.get(number) ?? 0) / drawCount) * 100 : 0,
    deOccurrences: deOccurrences.get(number) ?? 0,
    deRate: drawCount ? ((deOccurrences.get(number) ?? 0) / drawCount) * 100 : 0,
    lastLotoDate: lastLotoDate.get(number) ?? null,
    lastDeDate: lastDeDate.get(number) ?? null,
  }));

  const topLoto = [...numbers].sort((a, b) =>
    b.lotoOccurrences - a.lotoOccurrences || b.lotoHitDays - a.lotoHitDays || a.number.localeCompare(b.number)
  );
  const topDe = [...numbers].sort((a, b) =>
    b.deOccurrences - a.deOccurrences || a.number.localeCompare(b.number)
  );

  return {
    drawCount,
    totalLotoOccurrences,
    numbers,
    topLoto,
    topDe,
    averageLotoOccurrencesPerDraw: drawCount ? totalLotoOccurrences / drawCount : 0,
  };
}

/**
 * Walk-forward backtest: select the most frequent value from only the preceding
 * window, then compare it with the next draw. It is a historical experiment,
 * not a forecast or a promise of future hit rate.
 */
export function backtestFrequencyStrategy(
  draws: XsmbDraw[],
  windowSize: number,
  target: 'de' | 'loto',
): FrequencyBacktest {
  if (!Number.isInteger(windowSize) || windowSize < 1 || draws.length <= windowSize) {
    return { windowSize, bets: 0, hits: 0, hitRate: null };
  }

  let hits = 0;
  const bets = draws.length - windowSize;

  for (let index = windowSize; index < draws.length; index++) {
    const counts = new Map(ALL_NUMBERS.map(number => [number, 0]));
    for (let prior = index - windowSize; prior < index; prior++) {
      const values = target === 'de' ? [draws[prior].special] : draws[prior].loto;
      for (const number of values) counts.set(number, (counts.get(number) ?? 0) + 1);
    }
    const selected = [...ALL_NUMBERS].sort((a, b) =>
      (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b)
    )[0];
    const nextDraw = draws[index];
    const hit = target === 'de'
      ? nextDraw.special === selected
      : nextDraw.loto.includes(selected);
    if (hit) hits++;
  }

  return {
    windowSize,
    bets,
    hits,
    hitRate: bets ? (hits / bets) * 100 : null,
  };
}
