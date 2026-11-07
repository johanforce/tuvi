import { STAR_META } from '../catalog/star-metadata.js';
import { getStarBrightness } from '../data/brightness.js';
import { BRANCH_NAMES, STEM_NAMES } from '../engine/constants.js';
import type { ChartCore } from '../engine/types.js';

export interface GreatFortuneSelection {
  direction: 1 | -1;
  decadeIndex: number;
  startAge: number;
  endAge: number;
  yearInDecade?: number;
  branch: number;
}

/** Chuyển lá số engine thành dữ liệu luận giải; trạng thái công thức đã được xác nhận. */
export function makeReadingData(chart: ChartCore, selectedFortune?: GreatFortuneSelection) {
  const brightnessLabels: Record<string, string> = { M: 'Miếu', V: 'Vượng', 'Đ': 'Đắc', B: 'Bình', H: 'Hãm' };
  const trietByStem: Record<number, [number, number]> = {
    0: [8, 9], 1: [6, 7], 2: [4, 5], 3: [2, 3], 4: [0, 1],
    5: [8, 9], 6: [6, 7], 7: [4, 5], 8: [2, 3], 9: [0, 1],
  };
  let cycle = 0;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === chart.yearCanChi.stem && i % 12 === chart.yearCanChi.branch) { cycle = i; break; }
  }
  const xunStart = Math.floor(cycle / 10) * 10;
  const tuan = [(xunStart + 10) % 12, (xunStart + 11) % 12];
  const triet = trietByStem[chart.yearCanChi.stem] ?? [];

  return {
    source: 'buildChart engine; các công thức an sao đã được người dùng xác nhận',
    chart: {
      viewedYear: chart.viewedYear,
      viewedYearCanChi: chart.viewedYearCanChi.label,
      menhBranch: chart.menhBranch == null ? null : BRANCH_NAMES[chart.menhBranch],
      thanBranch: chart.thanBranch == null ? null : BRANCH_NAMES[chart.thanBranch],
      menhChu: chart.menhChu ?? null,
      thanChu: chart.thanChu ?? null,
      bureau: chart.bureau ?? null,
      greatFortuneCurrent: (selectedFortune ?? chart.greatFortune) ? {
        branch: BRANCH_NAMES[(selectedFortune ?? chart.greatFortune)!.branch],
        palace: chart.palaces.find(p => p.branch === (selectedFortune ?? chart.greatFortune)!.branch)?.name ?? null,
        canChi: (() => {
          const palace = chart.palaces.find(p => p.branch === (selectedFortune ?? chart.greatFortune)!.branch);
          return palace ? `${STEM_NAMES[palace.stem]} ${BRANCH_NAMES[palace.branch]}` : null;
        })(),
        startAge: (selectedFortune ?? chart.greatFortune)!.startAge,
        endAge: (selectedFortune ?? chart.greatFortune)!.endAge,
        startYear: chart.lunar.year + (selectedFortune ?? chart.greatFortune)!.startAge - 1,
        endYear: chart.lunar.year + (selectedFortune ?? chart.greatFortune)!.endAge - 1,
        yearInDecade: selectedFortune?.yearInDecade ?? (!selectedFortune ? chart.greatFortune?.yearInDecade : null),
        decadeIndex: (selectedFortune ?? chart.greatFortune)!.decadeIndex,
        decadeNumber: (selectedFortune ?? chart.greatFortune)!.decadeIndex + 1,
        direction: (selectedFortune ?? chart.greatFortune)!.direction,
      } : null,
      minorFortuneCurrent: {
        branch: BRANCH_NAMES[chart.tieuHanBranch],
        palace: chart.palaces.find(p => p.branch === chart.tieuHanBranch)?.name ?? null,
      },
      tuanBranches: tuan.map(b => BRANCH_NAMES[b]),
      trietBranches: triet.map(b => BRANCH_NAMES[b]),
      palaces: chart.palaces.map(p => ({
        name: p.name,
        branch: BRANCH_NAMES[p.branch],
        canChi: `${STEM_NAMES[p.stem]} ${BRANCH_NAMES[p.branch]}`,
        isMenh: p.branch === chart.menhBranch,
        isThan: p.branch === chart.thanBranch,
        hasTuan: tuan.includes(p.branch),
        hasTriet: triet.includes(p.branch),
        stars: p.stars.map(s => ({
          id: s.id,
          name: s.name,
          scope: s.scope,
          status: s.status,
          note: s.note ?? null,
          brightness: brightnessLabels[getStarBrightness(s.id.replace(/^luu-/, ''), s.branch) ?? ''] ?? null,
          brightnessStatus: STAR_META[s.id]?.brightnessStatus ?? 'UNVERIFIED',
        })),
      })),
      annualPendingStars: chart.annualPendingStars,
      engineWarnings: chart.warnings,
    },
    knownLimits: [
      'Chưa có bảng độ sáng sao đầy đủ đã xác minh.',
      'Một số sao chưa có bảng độ sáng đầy đủ.',
      'Payload chỉ có cung Đại Hạn đã chọn; không có danh sách sao riêng hoặc Tứ Hóa riêng của tầng Đại Hạn.',
      'Tiểu Hạn hiện có vị trí cung, không có danh sách sao riêng của tầng Tiểu Hạn.',
    ],
  };
}
