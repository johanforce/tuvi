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
        transform: 'translate(-50%, -50%)',
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

  return (
    <div className="w-full overflow-x-auto p-1 md:p-3 flex flex-col items-center">
      {/* VÙNG LÁ SỐ TỬ VI CHÍNH (FRAME 4X4) */}
      <div 
        id="tuvi-chart-container"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
        className="chart-board relative bg-[#ffffff] border-2 border-[#111111] w-[1040px] shadow-2xl font-sans"
      >
        <div className="chart-ribbon">
          <span>✦ NAM PHÁI THẤU TRIỆT</span>
          <strong>LÁ SỐ TỬ VI ĐẨU SỐ • TOÀN THƯ</strong>
          <span>{chart.viewedYearCanChi.label}</span>
        </div>
        {/* Lưới 4x4 gồm 12 cung + ô trung tâm */}
        <div className="grid grid-cols-4 grid-rows-4 w-full h-[980px] border-collapse relative">
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

          {/* HUY HIỆU ĐEN NẰM TRÊN ĐƯỜNG RANH GIỚI: TUẦN */}
          {sameVoidPair ? (
            tuanPos && (
              <div style={tuanPos} className="flex gap-1 pointer-events-none select-none">
                <span className="bg-black text-white text-[11px] font-bold px-3 py-0.5 rounded-sm shadow-md tracking-wider">Tuần</span>
                <span className="bg-black text-white text-[11px] font-bold px-3 py-0.5 rounded-sm shadow-md tracking-wider">Triệt</span>
              </div>
            )
          ) : (
            <>
              {tuanPos && (
                <div style={tuanPos} className="pointer-events-none select-none">
                  <span className="bg-black text-white text-[11px] font-bold px-3 py-0.5 rounded-sm shadow-md tracking-wider">Tuần</span>
                </div>
              )}
              {trietPos && (
                <div style={trietPos} className="pointer-events-none select-none">
                  <span className="bg-black text-white text-[11px] font-bold px-3 py-0.5 rounded-sm shadow-md tracking-wider">Triệt</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* THANH CHÚ GIẢI DƯỚI ĐÁY LÁ SỐ (Y HỆT ẢNH FIXTURE) */}
        <div className="chart-legend border-t px-4 py-2 flex items-center justify-between text-[11px] md:text-[11.5px] font-medium select-none">
          {/* Bên trái: M:Miếu, V:Vượng, Đ:Đắc, B:Bình hòa, H:Hãm */}
          <div className="flex items-center gap-3">
            <span><strong className="text-[#dc2626]">M:</strong>Miếu</span>
            <span><strong className="text-[#dc2626]">V:</strong>Vượng</span>
            <span><strong className="text-[#dc2626]">Đ:</strong>Đắc</span>
            <span><strong className="text-[#dc2626]">B:</strong>Bình hòa</span>
            <span><strong className="text-[#dc2626]">H:</strong>Hãm</span>
          </div>

          {/* Ở giữa: 5 ô màu ngũ hành Kim, Mộc, Thủy, Hỏa, Thổ */}
          <div className="flex items-center gap-3.5">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#6b7280] inline-block border border-stone-400"></span>
              Kim
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#16a34a] inline-block border border-stone-400"></span>
              Mộc
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#111827] inline-block border border-stone-400"></span>
              Thủy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#dc2626] inline-block border border-stone-400"></span>
              Hỏa
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#d97706] inline-block border border-stone-400"></span>
              Thổ
            </span>
          </div>

          {/* Bên phải: Mã lá số */}
          <div className="text-stone-600 font-serif">
            Lá số #13405
          </div>
        </div>
      </div>
    </div>
  );
};
