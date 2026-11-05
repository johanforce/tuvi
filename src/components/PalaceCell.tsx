import React from 'react';
import type { Palace, StarPlacement } from '../engine/types.js';
import { StarLabel } from './StarLabel.js';
import { getPalaceCanChiAbbr, getBranchElementInfo, getPalaceNameColor } from '../data/canChiHelper.js';
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
  const palaceNameColor = getPalaceNameColor(palace.name, isThan);

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

  // Highlight style khi chọn hoặc xung chiếu, tam hợp
  const getRelationBg = () => {
    switch (relation) {
      case 'selected':
        return 'bg-[#fff9eb] ring-2 ring-[#d97706] shadow-sm z-10';
      case 'opposite':
        return 'bg-[#f0f7ff] ring-1 ring-[#3b82f6]';
      case 'trine':
        return 'bg-[#f0fdf4] ring-1 ring-[#22c55e]';
      default:
        return 'bg-white hover:bg-[#faf9f5]';
    }
  };

  const displayName = isThan 
    ? (palace.name === 'Mệnh' ? 'MỆNH<THÂN>' : `${palace.name.toUpperCase()}<THÂN>`)
    : palace.name.toUpperCase();

  return (
    <div
      onClick={onClick}
      style={{
        gridRow: `${gridRow} / span 1`,
        gridColumn: `${gridCol} / span 1`,
      }}
      className={`palace-cell relative flex flex-col justify-between p-1.5 md:p-2 border border-[#333333] cursor-pointer transition-colors select-none overflow-hidden ${getRelationBg()}`}
      role="button"
      tabIndex={0}
      aria-label={`Cung ${palace.name} tại ${canChiAbbr}`}
    >
      {/* 1. DÒNG HEADER: Can Chi góc trái, Tên cung ở giữa, Đại hạn & Tháng góc phải */}
      <div>
        <div className="flex items-start justify-between border-b border-[#dddddd] pb-1 mb-1">
          {/* Góc trái: Can Chi viết tắt & Âm dương ngũ hành của cung */}
          <div className="text-left leading-tight">
            <span className="font-bold text-[12px] text-stone-900 block font-serif">
              {canChiAbbr}
            </span>
            <span className="text-[10px] text-stone-600 block">
              {branchElem}
            </span>
          </div>

          {/* Ở giữa: TÊN CUNG */}
          <div className="text-center px-1">
            <span className={`font-classical font-black text-[13px] md:text-[14px] uppercase tracking-wide ${palaceNameColor}`}>
              {displayName}
            </span>
          </div>

          {/* Góc phải: Số tuổi Đại Hạn & Tháng âm lịch Th.X */}
          <div className="text-right leading-tight">
            <span className="font-bold text-[12px] text-stone-900 block font-serif">
              {daiHanAge !== undefined ? daiHanAge : '—'}
            </span>
            <span className="text-[10px] text-stone-600 block">
              Th.{monthIndex}
            </span>
          </div>
        </div>

        {/* 2. CHÍNH TINH (Căn giữa, nổi bật hàng đầu) */}
        {filters.main && mainStars.length > 0 && (
          <div className="flex flex-col items-center justify-center gap-0.5 mb-1.5 pt-0.5 border-b border-[#f0f0f0] pb-1">
            {mainStars.map(star => (
              <StarLabel key={star.id} star={star} branch={palace.branch} isMain={true} />
            ))}
          </div>
        )}

        {/* 3. HAI CỘT PHỤ TINH: Cát tinh bên trái, Hung sát tinh bên phải */}
        <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5 min-h-[90px] text-[11px]">
          {/* Cột trái: Cát tinh */}
          <div className="flex flex-col gap-0.5 text-left">
            {leftColumnStars.map((s, idx) => (
              <StarLabel key={`${s.id}-${idx}`} star={s} branch={palace.branch} />
            ))}
          </div>

          {/* Cột phải: Hung / Sát / Hóa Kỵ */}
          <div className="flex flex-col gap-0.5 text-left">
            {rightColumnStars.map((s, idx) => (
              <StarLabel key={`${s.id}-${idx}`} star={s} branch={palace.branch} />
            ))}
          </div>
        </div>
      </div>

      {/* 4. DÒNG FOOTER CHÂN CUNG: ĐV.[Cung] trái, Vòng Tràng Sinh giữa, LN.[Cung] phải */}
      <div className="pt-1 border-t border-[#dddddd] flex items-center justify-between text-[10px] text-stone-700 font-medium">
        <span className="uppercase text-stone-800">
          {daiVanName || ''}
        </span>
        <span className="font-bold text-stone-900">
          {trangSinhStar?.name || '—'}
        </span>
        <span className="uppercase text-stone-800">
          {luuNienName || ''}
        </span>
      </div>
    </div>
  );
};
