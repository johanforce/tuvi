import { STAR_META } from '../catalog/star-metadata.js';
import { BRANCH_NAMES, STEM_NAMES } from '../engine/constants.js';
import type { ChartCore } from '../engine/types.js';

/** Chuyển lá số engine thành dữ liệu có nguồn gốc và trạng thái kiểm chứng rõ ràng. */
export function makeReadingData(chart: ChartCore) {
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
    source: 'buildChart engine; mỗi sao giữ status và note từ engine',
    chart: {
      viewedYear: chart.viewedYear,
      viewedYearCanChi: chart.viewedYearCanChi.label,
      menhBranch: chart.menhBranch == null ? null : BRANCH_NAMES[chart.menhBranch],
      thanBranch: chart.thanBranch == null ? null : BRANCH_NAMES[chart.thanBranch],
      menhChu: chart.menhChu ?? null,
      thanChu: chart.thanChu ?? null,
      bureau: chart.bureau ?? null,
      greatFortuneCurrent: chart.greatFortune ? {
        branch: BRANCH_NAMES[chart.greatFortune.branch],
        yearInDecade: chart.greatFortune.yearInDecade,
      } : null,
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
          brightness: STAR_META[s.id]?.brightness ?? null,
          brightnessStatus: STAR_META[s.id]?.brightnessStatus ?? 'UNVERIFIED',
        })),
      })),
      annualPendingStars: chart.annualPendingStars,
      engineWarnings: chart.warnings,
    },
    knownLimits: [
      'Chưa có bảng độ sáng sao đầy đủ đã xác minh.',
      'Trạng thái an sao có thể là ứng viên/chưa kiểm chứng; phải đọc status và note từng sao.',
      'Payload chỉ có đại hạn hiện tại; không có bảng đại hạn trọn đời đã kiểm chứng.',
    ],
  };
}
