import React from 'react';
import type { Palace, StarPlacement } from '../engine/types.js';
import { StarLabel } from './StarLabel.js';
import { getPalaceCanChiAbbr, getBranchElementInfo, getBranchElementColor } from '../data/canChiHelper.js';
import type { RelationType, StarVisibilityFilters } from '../types/chartUI.js';

interface PalaceCellProps {
  palace: Palace;
  isThan: boolean;
  daiHanAge?: number;
  monthIndex: number; // 1..12
  daiVanName?: string; // e.g. "ĐV.HUYNH"
  luuNienName?: string; // e.g. "LN.QUAN"
  relation: RelationType;
  filters: StarVisibilityFilters;
  onClick: () => void;
  gridRow: number;
  gridCol: number;
}

const HUNG_SAT_STAR_IDS = new Set([
  'kinh-duong', 'da-la', 'hoa-tinh', 'linh-tinh', 'dia-khong', 'dia-kiep',
  'thien-khong', 'kiep-sat', 'tang-mon', 'bach-ho', 'thien-khoc', 'thien-hu',
  'thien-hinh', 'thien-dieu', 'co-than', 'qua-tu', 'dai-hao', 'tieu-hao',
  'pha-toai', 'dau-quan', 'hoa-ky', 'tu-phu', 'truc-phu', 'dieu-khach',
  'benh-phu', 'phuc-binh', 'quan-phu', 'quan-phu-bs', 'tue-pha', 'am-sat',
  'thien-nguyet', 'luu-ha', 'thien-thuong', 'thien-su', 'thien-la', 'dia-vong',
  'luu-thai-tue', 'luu-kinh-duong', 'luu-da-la', 'luu-tang-mon', 'luu-bach-ho',
  'luu-thien-khoc', 'luu-thien-hu', 'luu-kiep-sat', 'luu-hoa-ky', 'luu-thien-khong',
  'thai-tue-2', 'thai-tue-4', 'thai-tue-5', 'thai-tue-6', 'thai-tue-8', 'thai-tue-10', 'thai-tue-11',
  'bac-si-3', 'bac-si-8', 'bac-si-9', 'bac-si-10', 'bac-si-11'
]);

export const PalaceCell: React.FC<PalaceCellProps> = ({
  palace,
  isThan,
  daiHanAge,
  monthIndex,
  daiVanName,
  luuNienName,
  relation,
  filters,
  onClick,
  gridRow,
  gridCol,
}) => {
  const canChiAbbr = getPalaceCanChiAbbr(palace.stem, palace.branch);
  const branchElem = getBranchElementInfo(palace.branch);
  const branchColor = getBranchElementColor(palace.branch);

  // 14 chính tinh
  const MAIN_STAR_IDS = new Set([
    'tu-vi', 'thien-co', 'thai-duong', 'vu-khuc', 'thien-dong', 'liem-trinh',
    'thien-phu', 'thai-am', 'tham-lang', 'cu-mon', 'thien-tuong', 'thien-luong',
    'that-sat', 'pha-quan'
  ]);

  const mainStars = palace.stars.filter(s => MAIN_STAR_IDS.has(s.id));
  const trangSinhStar = palace.stars.find(s => s.id.startsWith('trang-sinh-'));

  // Lọc các sao khác (loại bỏ chính tinh, tràng sinh, và tuần triệt dạng sao)
  const remainingStars = palace.stars.filter(s => {
    if (MAIN_STAR_IDS.has(s.id)) return false;
    if (trangSinhStar && s.id === trangSinhStar.id) return false;
    if (s.name.includes('Tuần') || s.name.includes('Triệt')) return false;

    // Bộ lọc
    if (!filters.secondary && s.scope === 'natal' && !s.id.includes('hoa-')) return false;
    if (!filters.transformation && (s.id.includes('hoa-') || s.name.includes('Hóa'))) return false;
    if (!filters.annual && s.scope === 'annual') return false;

    return true;
  });

  // Tách thành 2 cột: Cát tinh (trái) và Hung/Sát tinh (phải)
  const leftColumnStars: StarPlacement[] = [];
  const rightColumnStars: StarPlacement[] = [];

  for (const s of remainingStars) {
    const isHungSat = HUNG_SAT_STAR_IDS.has(s.id) || 
                      s.name.includes('Kỵ') || 
                      s.name.includes('Đà La') || 
                      s.name.includes('Kình Dương') ||
                      s.name.includes('Tang Môn') ||
                      s.name.includes('Bạch Hổ') ||
                      s.name.includes('Địa Không') ||
                      s.name.includes('Địa Kiếp') ||
                      s.name.includes('Hỏa Tinh') ||
                      s.name.includes('Linh Tinh');

    if (isHungSat) {
      rightColumnStars.push(s);
    } else {
      leftColumnStars.push(s);
    }
  }

  const isMenh = palace.name === 'Mệnh';

  // Highlight khi chọn / xung chiếu / tam hợp (ring-inset để không bị overflow cắt mất)
  const getRelationBg = () => {
    switch (relation) {
      case 'selected':
        return 'bg-amber-100/80 ring-2 ring-inset ring-oriental-gold z-10';
      case 'opposite':
        return 'bg-sky-50/80 ring-1 ring-inset ring-sky-400/70';
      case 'trine':
        return 'bg-emerald-50/80 ring-1 ring-inset ring-emerald-400/70';
      default:
        return isMenh
          ? 'bg-red-50/60 ring-1 ring-inset ring-oriental-crimson/30 hover:bg-red-50'
          : 'bg-transparent hover:bg-amber-50/70';
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        gridRow: `${gridRow} / span 1`,
        gridColumn: `${gridCol} / span 1`,
      }}
      className={`palace-cell relative flex cursor-pointer select-none flex-col justify-between overflow-hidden border-b border-r border-amber-900/25 p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-oriental-gold md:p-2 ${getRelationBg()}`}
      role="button"
      tabIndex={0}
      aria-label={`Cung ${palace.name} tại ${canChiAbbr}`}
    >
      <div>
        {/* 1. HEADER: Can Chi (trái) • Tên cung (giữa) • Đại hạn & tháng (phải) */}
        <div className="mb-1.5 flex items-start justify-between border-b border-amber-900/15 pb-1">
          <div className="text-left leading-tight">
            <span className="block font-serif text-[12px] font-bold text-amber-900">
              {canChiAbbr}
            </span>
            <span className="block text-[10px] font-medium" style={{ color: branchColor }}>
              {branchElem}
            </span>
          </div>

          <div className="flex flex-col items-center px-1">
            <span
              className={`font-classical text-[13px] font-extrabold uppercase tracking-wide md:text-[14px] ${
                isMenh ? 'rounded bg-red-100/80 px-1.5 text-oriental-crimson' : ''
              }`}
              style={isMenh ? undefined : { color: branchColor }}
            >
              {palace.name.toUpperCase()}
            </span>
            {isThan && (
              <span className="mt-0.5 rounded bg-amber-600 px-1.5 text-[9px] font-bold leading-4 tracking-wider text-white">
                THÂN
              </span>
            )}
          </div>

          <div className="text-right leading-tight">
            <span className="block font-serif text-[12px] font-bold text-stone-800">
              {daiHanAge !== undefined ? daiHanAge : '—'}
            </span>
            <span className="block text-[10px] text-stone-500">Th.{monthIndex}</span>
          </div>
        </div>

        {/* 2. CHÍNH TINH — căn giữa, nổi bật */}
        {filters.main && mainStars.length > 0 && (
          <div className="mb-1.5 flex flex-col items-center justify-center gap-0.5 border-b border-amber-900/10 pb-1.5 pt-0.5">
            {mainStars.map(star => (
              <StarLabel key={star.id} star={star} branch={palace.branch} isMain={true} />
            ))}
          </div>
        )}

        {/* 3. HAI CỘT PHỤ TINH: Cát tinh (trái) • Hung sát tinh (phải) */}
        <div className="grid min-h-[90px] grid-cols-2 gap-x-1.5 gap-y-0.5 text-[11px]">
          <div className="flex flex-col gap-0.5 text-left">
            {leftColumnStars.map((s, idx) => (
              <StarLabel key={`${s.id}-${idx}`} star={s} branch={palace.branch} />
            ))}
          </div>

          <div className="flex flex-col gap-0.5 text-left">
            {rightColumnStars.map((s, idx) => (
              <StarLabel key={`${s.id}-${idx}`} star={s} branch={palace.branch} />
            ))}
          </div>
        </div>
      </div>

      {/* 4. FOOTER: ĐV.[Cung] • Tràng Sinh • LN.[Cung] */}
      <div className="mt-2 flex items-center justify-between border-t border-dashed border-amber-900/25 pt-1 text-[10px] font-medium text-stone-500">
        <span className="uppercase">{daiVanName || ''}</span>
        <span className="font-bold text-amber-800">{trangSinhStar?.name || '—'}</span>
        <span className="uppercase">{luuNienName || ''}</span>
      </div>
    </div>
  );
};
