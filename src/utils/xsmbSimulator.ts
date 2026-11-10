// Intentionally kept as a pure simulator: every invocation generates one independent XSMB draw.
export interface XsmbPrizeResult {
  group: string;
  label: string;
  value: string;
  threeDigit: string | null;
}

export interface XsmbSession {
  createdAt: string;
  results: XsmbPrizeResult[];
  specialThreeDigit: string;
  lotoThreeDigits: string[];
}

export const XSMB_PRIZE_STRUCTURE = [
  { group: 'ĐB', label: 'Đặc biệt', count: 1, digits: 5 },
  { group: 'G1', label: 'Giải nhất', count: 1, digits: 5 },
  { group: 'G2', label: 'Giải nhì', count: 2, digits: 5 },
  { group: 'G3', label: 'Giải ba', count: 6, digits: 5 },
  { group: 'G4', label: 'Giải tư', count: 4, digits: 4 },
  { group: 'G5', label: 'Giải năm', count: 6, digits: 4 },
  { group: 'G6', label: 'Giải sáu', count: 3, digits: 3 },
  { group: 'G7', label: 'Giải bảy', count: 4, digits: 2 },
] as const;

function randomDigits(length: number, random: () => number): string {
  const value = Math.floor(Math.max(0, Math.min(0.999999999999, random())) * (10 ** length));
  return String(value).padStart(length, '0');
}

export function simulateXsmbSession(random: () => number = Math.random, now: Date = new Date()): XsmbSession {
  const results: XsmbPrizeResult[] = [];
  for (const prize of XSMB_PRIZE_STRUCTURE) {
    for (let index = 0; index < prize.count; index++) {
      const value = randomDigits(prize.digits, random);
      results.push({ group: prize.group, label: prize.label, value, threeDigit: value.length >= 3 ? value.slice(-3) : null });
    }
  }
  const special = results.find(result => result.group === 'ĐB');
  if (!special?.threeDigit) throw new Error('Không thể tạo kết quả giải đặc biệt cho phiên XSMB giả lập.');
  return {
    createdAt: now.toISOString(),
    results,
    specialThreeDigit: special.threeDigit,
    lotoThreeDigits: results.filter(result => result.threeDigit !== null).map(result => result.threeDigit as string),
  };
}
