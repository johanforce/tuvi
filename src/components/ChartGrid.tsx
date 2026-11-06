import React from 'react';
import type { ChartCore, Palace } from '../engine/types.js';
import { PalaceCell } from './PalaceCell.js';
import { CenterInfo } from './CenterInfo.js';
import type { RelationType, StarVisibilityFilters } from '../types/chartUI.js';
import { getPalaceRelations } from '../types/chartUI.js';

interface ChartGridProps {
  chart: ChartCore;
  selectedBranch: number | null;
  onSelectPalace: (branch: number) => void;
  filters: StarVisibilityFilters;
  zoom: number;
}

// Tọa độ lưới 4x4 chuẩn xác
const GRID_COORDINATES: Record<number, { row: number; col: number }> = {
  5: { row: 1, col: 1 }, // Tỵ
  6: { row: 1, col: 2 }, // Ngọ
  7: { row: 1, col: 3 }, // Mùi
  8: { row: 1, col: 4 }, // Thân
  4: { row: 2, col: 1 }, // Thìn
  9: { row: 2, col: 4 }, // Dậu
  3: { row: 3, col: 1 }, // Mão
  10: { row: 3, col: 4 }, // Tuất
  2: { row: 4, col: 1 }, // Dần
  1: { row: 4, col: 2 }, // Sửu
  0: { row: 4, col: 3 }, // Tý
  11: { row: 4, col: 4 }, // Hợi
};

// Triệt Không theo Can năm sinh
const TRIET_KHONG_BY_STEM: Record<number, [number, number]> = {
  0: [8, 9], // Giáp: Thân, Dậu
  1: [6, 7], // Ất: Ngọ, Mùi
  2: [4, 5], // Bính: Thìn, Tỵ
  3: [2, 3], // Đinh: Dần, Mão
  4: [0, 1], // Mậu: Tý, Sửu
  5: [8, 9], // Kỷ: Thân, Dậu
  6: [6, 7], // Canh: Ngọ, Mùi
  7: [4, 5], // Tân: Thìn, Tỵ
  8: [2, 3], // Nhâm: Dần, Mão
  9: [0, 1], // Quý: Tý, Sửu
};

// Tuần Không theo Giáp tuần
function getTuanKhong(yearStem: number, yearBranch: number): [number, number] {
  let cycle = 0;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === (yearStem % 10) && i % 12 === (yearBranch % 12)) {
      cycle = i;
      break;
    }
  }
  const xunStart = Math.floor(cycle / 10) * 10;
  const startBranch = xunStart % 12;
  return [(startBranch + 10) % 12, (startBranch + 11) % 12];
}

const DAI_VAN_PALACES = [
  'ĐV.MỆNH', 'ĐV.PHỤ', 'ĐV.PHÚC', 'ĐV.ĐIỀN', 'ĐV.QUAN', 'ĐV.NÔ',
  'ĐV.DI', 'ĐV.TẬT', 'ĐV.TÀI', 'ĐV.TỬ', 'ĐV.PHỐI', 'ĐV.HUYNH'
];

const LUU_NIEN_PALACES = [
  'LN.MỆNH', 'LN.PHỤ', 'LN.PHÚC', 'LN.ĐIỀN', 'LN.QUAN', 'LN.NÔ',
  'LN.DI', 'LN.TẬT', 'LN.TÀI', 'LN.TỬ', 'LN.PHỐI', 'LN.HUYNH'
];

export const ChartGrid: React.FC<ChartGridProps> = ({
  chart,
  selectedBranch,
  onSelectPalace,
  filters,
  zoom,
}) => {
  const relations = getPalaceRelations(selectedBranch);
  const tuanBranches = getTuanKhong(chart.yearCanChi.stem, chart.yearCanChi.branch);
  const trietBranches = TRIET_KHONG_BY_STEM[chart.yearCanChi.stem % 10] || [-1, -1];

  const palaceByBranch = new Map<number, Palace>();
  for (const p of chart.palaces) {
    palaceByBranch.set(p.branch, p);
  }

  // Tuổi mụ & Đại vận hiện tại
  const solarYearNum = parseInt(chart.input.solarDate.split('-')[0]!, 10);
  const ageNominal = chart.viewedYear >= solarYearNum ? chart.viewedYear - solarYearNum + 1 : 1;
  const bureauNum = chart.bureau?.number || 2;
  const isYang = chart.yearCanChi.stem % 2 === 0;
  const isMale = chart.input.gender === 'nam';
  const isClockwise = (isYang && isMale) || (!isYang && !isMale);
  const menhBr = chart.menhBranch !== undefined ? chart.menhBranch : 2;

  // Tính tuổi khởi Đại Hạn ở từng cung
  const getDaiHanAge = (branch: number): number | undefined => {
    if (!chart.bureau || chart.menhBranch === undefined) return undefined;
    const dist = isClockwise
      ? (branch - menhBr + 12) % 12
      : (menhBr - branch + 12) % 12;
    return bureauNum + dist * 10;
  };

  // Cung gốc Đại Vận hiện tại (ĐV.MỆNH)
  const dvStep = Math.max(0, Math.floor((ageNominal - bureauNum) / 10));
  const currentDaiVanBranch = isClockwise ? (menhBr + dvStep) % 12 : (menhBr - dvStep + 12) % 12;

  // Lưu Niên an theo Chi năm xem; không hard-code theo fixture và không phụ thuộc Đại Hạn.
  const luuNienMenhBranch = chart.viewedYearCanChi.branch;

  // Tháng âm lịch định vị cung Th.1 .. Th.12
  // Khởi Th.1 từ (Chi năm xem - (tháng sinh - 1))
  const startMonthBranch = (chart.viewedYearCanChi.branch - (chart.lunar.month - 1) + 12) % 12;

  // Tính vị trí huy hiệu Tuần & Triệt trên đường ranh giới
  const getBadgePosition = (branches: [number, number]): React.CSSProperties | null => {
    const [b1, b2] = branches;
    const c1 = GRID_COORDINATES[b1];
    const c2 = GRID_COORDINATES[b2];
    if (!c1 || !c2) return null;

    // Tọa độ tính theo phần trăm của lưới để tâm nhãn nằm đúng trung điểm cạnh chung.
    if (c1.row === c2.row && Math.abs(c1.col - c2.col) === 1) {
      const edgeCol = Math.min(c1.col, c2.col);
      return {
        position: 'absolute',
        left: `${edgeCol * 25}%`,
        top: `${(c1.row - 0.5) * 25}%`,
        transform: 'translate(-50%, -50%) rotate(90deg)',
        zIndex: 50,
      };
    }

    if (c1.col === c2.col && Math.abs(c1.row - c2.row) === 1) {
      const edgeRow = Math.min(c1.row, c2.row);
      return {
        position: 'absolute',
        left: `${(c1.col - 0.5) * 25}%`,
        top: `${edgeRow * 25}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 50,
      };
    }

    return null;
  };

  // Tuần và Triệt có thể cùng án một cặp cung; khi đó gom hai nhãn tại cùng trung điểm.
  const sameVoidPair = tuanBranches[0] === trietBranches[0] && tuanBranches[1] === trietBranches[1];
  const tuanPos = getBadgePosition(tuanBranches);
  const trietPos = getBadgePosition(trietBranches);

  // Cặp cung nằm cạnh nhau theo chiều ngang có đường neo dọc, nên xoay
  // nhãn để chiều dài của nhãn chạy song song với đường ranh giới đó.
  const isVerticalAnchor = (branches: [number, number]): boolean => {
    const first = GRID_COORDINATES[branches[0]];
    const second = GRID_COORDINATES[branches[1]];
    return Boolean(first && second && first.row === second.row && Math.abs(first.col - second.col) === 1);
  };
  const tuanVerticalAnchor = isVerticalAnchor(tuanBranches);
  const trietVerticalAnchor = isVerticalAnchor(trietBranches);

  // Huy hiệu Tuần / Triệt nằm trên đường ranh giới giữa hai cung
  const VOID_BADGE =
    'rounded border border-amber-400/50 bg-oriental-ink px-3 py-0.5 text-[11px] font-bold tracking-wider text-amber-200 shadow-md';

  return (
    <div className="flex w-full flex-col items-center overflow-x-auto p-1 md:p-3">
      {/* VÙNG LÁ SỐ TỬ VI CHÍNH (FRAME 4X4) */}
      <div
        id="tuvi-chart-container"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
        className="chart-board relative w-[1040px] overflow-hidden rounded-2xl border-2 border-amber-900/40 bg-[#fcfaf4] font-sans shadow-celestial"
      >
        {/* Dải tiêu đề hoàng gia */}
        <div className="flex items-center justify-between border-b border-amber-600/30 bg-gradient-to-r from-amber-900 via-oriental-gold to-amber-900 px-4 py-1.5 font-serif text-xs font-semibold uppercase tracking-widest text-amber-100">
          <span>Địa Bàn 4×4 • Thiên Bàn 2×2</span>
          <span className="text-sm font-bold tracking-wider">Lá Số Tử Vi Đẩu Số • Toàn Thư</span>
          <span>Năm xem: {chart.viewedYearCanChi.label}</span>
        </div>

        {/* Lưới 4x4 gồm 12 cung + ô trung tâm */}
        <div className="relative grid h-[980px] w-full grid-cols-4 grid-rows-4 border-l border-t border-amber-900/25">
          {Array.from({ length: 12 }, (_, i) => i).map(branch => {
            const palace = palaceByBranch.get(branch);
            if (!palace) return null;
            const coords = GRID_COORDINATES[branch];
            if (!coords) return null;

            const isThan = chart.thanBranch === branch;
            const daiHanAge = getDaiHanAge(branch);
            const rel: RelationType = relations[branch] || 'none';

            // Tính Th.X
            const monthIdx = ((branch - startMonthBranch + 12) % 12) + 1;

            // Tính ĐV.[Cung]
            const dvDist = (branch - currentDaiVanBranch + 12) % 12;
            const dvName = DAI_VAN_PALACES[dvDist];

            // Tính LN.[Cung]
            const lnDist = (branch - luuNienMenhBranch + 12) % 12;
            const lnName = LUU_NIEN_PALACES[lnDist];

            return (
              <PalaceCell
                key={branch}
                palace={palace}
                isThan={isThan}
                daiHanAge={daiHanAge}
                monthIndex={monthIdx}
                daiVanName={dvName}
                luuNienName={lnName}
                relation={rel}
                filters={filters}
                onClick={() => onSelectPalace(branch)}
                gridRow={coords.row}
                gridCol={coords.col}
              />
            );
          })}

          {/* Ô THIÊN BÀN TRUNG TÂM (CHIẾM VÙNG 2X2) */}
          <CenterInfo chart={chart} />

          {/* HUY HIỆU TUẦN / TRIỆT TRÊN ĐƯỜNG RANH GIỚI */}
          {sameVoidPair ? (
            tuanPos && (
              <div style={tuanPos} className={`pointer-events-none flex select-none gap-1 ${tuanVerticalAnchor ? 'flex-col' : ''}`}>
                <span className={VOID_BADGE}>Tuần</span>
                <span className={VOID_BADGE}>Triệt</span>
              </div>
            )
          ) : (
            <>
              {tuanPos && (
                <div style={tuanPos} className="pointer-events-none select-none">
                  <span className={VOID_BADGE}>Tuần</span>
                </div>
              )}
              {trietPos && (
                <div style={trietPos} className="pointer-events-none select-none">
                  <span className={VOID_BADGE}>Triệt</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* THANH CHÚ GIẢI DƯỚI ĐÁY LÁ SỐ */}
        <div className="flex select-none items-center justify-between border-t border-amber-900/25 bg-[#f7f1e1] px-4 py-2 text-[11.5px] font-medium text-stone-700">
          {/* Độ sáng sao */}
          <div className="flex items-center gap-3">
            <span><strong className="text-rose-600">M</strong> Miếu</span>
            <span><strong className="text-blue-600">V</strong> Vượng</span>
            <span><strong className="text-emerald-600">Đ</strong> Đắc</span>
            <span><strong className="text-amber-600">B</strong> Bình hòa</span>
            <span><strong className="text-slate-500">H</strong> Hãm</span>
          </div>

          {/* Ngũ hành */}
          <div className="flex items-center gap-3.5">
            <span className="flex items-center gap-1.5 font-semibold text-element-kim">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-element-kim" /> Kim
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-element-moc">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-element-moc" /> Mộc
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-element-thuy">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-element-thuy" /> Thủy
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-element-hoa">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-element-hoa" /> Hỏa
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-element-tho">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-element-tho" /> Thổ
            </span>
          </div>

          <div className="font-serif font-semibold text-amber-900">Lá số #13405</div>
        </div>
      </div>
    </div>
  );
};
