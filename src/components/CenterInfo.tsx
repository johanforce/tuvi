import React from 'react';
import type { ChartCore } from '../engine/types.js';
import { getNapAm } from '../data/napAm.js';
import { getMenhCucRelation } from '../data/canChiHelper.js';

interface CenterInfoProps {
  chart: ChartCore;
}

const ELEMENT_TEXT_CLASSES: Record<'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ', string> = {
  Kim: 'text-element-kim',
  Mộc: 'text-element-moc',
  Thủy: 'text-element-thuy',
  Hỏa: 'text-element-hoa',
  Thổ: 'text-element-tho',
};

function getElementTextClass(label: string): string {
  const element = (Object.keys(ELEMENT_TEXT_CLASSES) as Array<keyof typeof ELEMENT_TEXT_CLASSES>)
    .find(name => label.includes(name));
  return element ? ELEMENT_TEXT_CLASSES[element] : 'text-stone-600';
}

/**
 * TỌA ĐỘ HÌNH HỌC CHUẨN XÁC CỦA 12 ĐỊA CHI TRÊN ĐƯỜNG BIÊN Ô THIÊN BÀN (2x2):
 * - Nếu ở 4 góc (Tứ Sinh: Dần, Thân, Tỵ, Hợi) -> lấy điểm góc trong (0,0; 100,0; 100,100; 0,100).
 * - Nếu ở cạnh -> lấy đúng trung điểm của cung tiếp giáp trên cạnh bên trong.
 *
 * Cụ thể theo lưới 4x4:
 * - Hàng 1 (trên): Tỵ (cột 1) | Ngọ (cột 2) | Mùi (cột 3) | Thân (cột 4)
 * - Cột 4 (phải): Thân (hàng 1) | Dậu (hàng 2) | Tuất (hàng 3) | Hợi (hàng 4)
 * - Hàng 4 (dưới): Dần (cột 1) | Sửu (cột 2) | Tý (cột 3) | Hợi (cột 4)
 * - Cột 1 (trái): Tỵ (hàng 1) | Thìn (hàng 2) | Mão (hàng 3) | Dần (hàng 4)
 */
const BRANCH_ANCHOR_COORDS: Record<number, { x: number; y: number; label: string }> = {
  // 4 Cung ở Góc (Điểm góc trong của ô Thiên Bàn):
  5: { x: 0, y: 0, label: 'Tỵ' },        // Góc trên - trái (giáp Tỵ)
  8: { x: 100, y: 0, label: 'Thân' },     // Góc trên - phải (giáp Thân)
  11: { x: 100, y: 100, label: 'Hợi' },  // Góc dưới - phải (giáp Hợi)
  2: { x: 0, y: 100, label: 'Dần' },      // Góc dưới - trái (giáp Dần)

  // 8 Cung ở Cạnh (Trung điểm cạnh bên trong giáp cung đó):
  6: { x: 25, y: 0, label: 'Ngọ' },       // Cạnh trên, nửa trái (giáp Ngọ ở cột 2)
  7: { x: 75, y: 0, label: 'Mùi' },       // Cạnh trên, nửa phải (giáp Mùi ở cột 3)
  9: { x: 100, y: 25, label: 'Dậu' },     // Cạnh phải, nửa trên (giáp Dậu ở hàng 2)
  10: { x: 100, y: 75, label: 'Tuất' },   // Cạnh phải, nửa dưới (giáp Tuất ở hàng 3)
  1: { x: 25, y: 100, label: 'Sửu' },     // Cạnh dưới, nửa trái (giáp Sửu ở cột 2)
  0: { x: 75, y: 100, label: 'Tý' },      // Cạnh dưới, nửa phải (giáp Tý ở cột 3)
  4: { x: 0, y: 25, label: 'Thìn' },      // Cạnh trái, nửa trên (giáp Thìn ở hàng 2)
  3: { x: 0, y: 75, label: 'Mão' },       // Cạnh trái, nửa dưới (giáp Mão ở hàng 3)
};

export const CenterInfo: React.FC<CenterInfoProps> = ({ chart }) => {
  const { input, lunar, yearCanChi, monthCanChi, dayCanChi, hourCanChi, viewedYear, viewedYearCanChi } = chart;

  // Dương Nam / Âm Nam / Dương Nữ / Âm Nữ
  const isYangYear = yearCanChi.stem % 2 === 0;
  const genderLabel = input.gender === 'nam'
    ? (isYangYear ? 'Dương Nam' : 'Âm Nam')
    : (isYangYear ? 'Dương Nữ' : 'Âm Nữ');

  // Ngày dương lịch
  const [sYear, sMonth, sDay] = input.solarDate.split('-');
  const solarYearNum = parseInt(sYear, 10);
  const solarMonthNum = parseInt(sMonth, 10);
  const solarDayNum = parseInt(sDay, 10);

  // Giờ sinh
  const hourText = input.unknownTime
    ? 'Chưa xác định giờ'
    : `${input.hour || 0} giờ ${String(input.minute || 0).padStart(2, '0')} phút`;

  // Bản mệnh Nạp âm & Cục
  const napAmLabel = getNapAm(yearCanChi.label);
  const bureauName = chart.bureau?.name || 'Chưa xác định';
  const napAmTextClass = getElementTextClass(napAmLabel);
  const bureauTextClass = getElementTextClass(bureauName);
  const menhCucRelation = getMenhCucRelation(napAmLabel, bureauName);

  // Tuổi mụ
  const ageNominal = viewedYear >= solarYearNum ? viewedYear - solarYearNum + 1 : 1;

  // Cung Lai Nhân: cung có Can trùng với Can năm sinh
  const laiNhanPalace = chart.palaces.find(p => p.stem === yearCanChi.stem);

  // TÍNH ĐƯỜNG NỐI HÌNH HỌC TỪ CUNG THÂN THEO ĐÚNG YÊU CẦU:
  // - Đường ĐỎ: Nối từ Cung Thân đến Cung đối diện (Xung chiếu: (thanBranch + 6) % 12).
  // - Đường TÍM: Nối từ Cung Thân đến 2 cung tạo thành tam giác Tam Hợp ((thanBranch + 4) % 12 và (thanBranch + 8) % 12).
  const thanBr = chart.thanBranch !== undefined 
    ? chart.thanBranch 
    : (chart.menhBranch !== undefined ? chart.menhBranch : 11);

  const oppositeBr = (thanBr + 6) % 12;
  const trine1Br = (thanBr + 4) % 12;
  const trine2Br = (thanBr + 8) % 12;

  const pThan = BRANCH_ANCHOR_COORDS[thanBr] || { x: 100, y: 100 };
  const pOpp = BRANCH_ANCHOR_COORDS[oppositeBr] || { x: 0, y: 0 };
  const pTrine1 = BRANCH_ANCHOR_COORDS[trine1Br] || { x: 0, y: 75 };
  const pTrine2 = BRANCH_ANCHOR_COORDS[trine2Br] || { x: 75, y: 0 };

  return (
    <div
      style={{
        gridRow: '2 / span 2',
        gridColumn: '2 / span 2',
      }}
      className="center-cell relative flex select-none flex-col justify-between overflow-hidden border-b border-r border-red-900/20 bg-gradient-to-b from-[#fffafa] via-[#fff3f3] to-[#fce9e9] p-3 shadow-inner"
    >
      {/* Biểu tượng âm dương làm nền trang trí */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <g opacity="0.18">
          <circle cx="200" cy="200" r="120" fill="#fffafa" stroke="#8a1c1c" strokeWidth="3" />
          <path d="M 200 80 A 120 120 0 0 1 200 320 L 200 80 Z" fill="#8a1c1c" />
          <circle cx="200" cy="140" r="60" fill="#fffafa" />
          <circle cx="200" cy="260" r="60" fill="#8a1c1c" />
          <circle cx="200" cy="140" r="15" fill="#8a1c1c" />
          <circle cx="200" cy="260" r="15" fill="#fffafa" />
        </g>
      </svg>

      {/* ĐƯỜNG NỐI TỪ CUNG THÂN
          - ĐỎ: Cung Thân ↔ cung đối diện (xung chiếu)
          - TÍM: tam giác Tam Hợp của Cung Thân */}
      <svg
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-60"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points={`${pThan.x},${pThan.y} ${pTrine1.x},${pTrine1.y} ${pTrine2.x},${pTrine2.y}`}
          fill="rgba(179, 38, 30, 0.04)"
          stroke="#b3261e"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <line x1={pThan.x} y1={pThan.y} x2={pOpp.x} y2={pOpp.y} stroke="#dc2626" strokeWidth="1" />
        <circle cx={pThan.x} cy={pThan.y} r="1.5" fill="#dc2626" />
        <circle cx={pOpp.x} cy={pOpp.y} r="1.5" fill="#dc2626" />
        <circle cx={pTrine1.x} cy={pTrine1.y} r="1.4" fill="#b3261e" />
        <circle cx={pTrine2.x} cy={pTrine2.y} r="1.4" fill="#b3261e" />
      </svg>

      {/* NHÃN ĐỊA CHI QUANH VIỀN */}
      <span className="pointer-events-none absolute z-10 font-serif text-[10px] text-amber-900/60 left-1.5 top-1">Mùi</span>
      <span className="pointer-events-none absolute z-10 font-serif text-[10px] text-amber-900/60 right-1.5 top-1">Tuất</span>
      <span className="pointer-events-none absolute z-10 font-serif text-[10px] text-amber-900/60 bottom-1 right-1.5">Sửu</span>
      <span className="pointer-events-none absolute z-10 font-serif text-[10px] text-amber-900/60 bottom-1 left-1.5">Thìn</span>
      <span className="pointer-events-none absolute z-10 font-serif text-[10px] text-amber-900/60 top-0.5 -translate-x-1/2" style={{ left: '25%' }}>Thân</span>
      <span className="pointer-events-none absolute z-10 font-serif text-[10px] text-amber-900/60 top-0.5 -translate-x-1/2" style={{ left: '75%' }}>Dậu</span>
      <span className="pointer-events-none absolute z-10 font-serif text-[10px] text-amber-900/60 right-1 -translate-y-1/2" style={{ top: '25%' }}>Hợi</span>
      <span className="pointer-events-none absolute z-10 font-serif text-[10px] text-amber-900/60 right-1 -translate-y-1/2" style={{ top: '75%' }}>Tý</span>
      <span className="pointer-events-none absolute z-10 font-serif text-[10px] text-amber-900/60 bottom-0.5 -translate-x-1/2" style={{ left: '25%' }}>Mão</span>
      <span className="pointer-events-none absolute z-10 font-serif text-[10px] text-amber-900/60 bottom-0.5 -translate-x-1/2" style={{ left: '75%' }}>Dần</span>
      <span className="pointer-events-none absolute z-10 font-serif text-[10px] text-amber-900/60 left-1 -translate-y-1/2" style={{ top: '25%' }}>Ngọ</span>
      <span className="pointer-events-none absolute z-10 font-serif text-[10px] text-amber-900/60 left-1 -translate-y-1/2" style={{ top: '75%' }}>Tỵ</span>

      {/* NỘI DUNG THIÊN BÀN */}
      <div className="relative z-10 flex h-full flex-col justify-between px-3 py-1">
        <div className="pt-1 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-900/80">
            Trang Tử Vi Cổ Học Hàng Đầu Việt Nam
          </p>
          <a
            href="https://tuvidauso.ai.studio"
            target="_blank"
            rel="noreferrer"
            className="block font-mono text-[12px] text-blue-600 hover:underline"
          >
            https://tuvidauso.ai.studio
          </a>
          <h2 className="mt-1 font-serif text-[26px] font-bold tracking-wide text-oriental-crimson">
            Lá Số Tử Vi
          </h2>
          <hr className="gold-rule mx-auto mt-1 w-2/3" />
        </div>

        <div className="my-auto space-y-1 pl-2 pr-6 text-[12px] font-medium leading-[1.45] text-stone-800">
          <div className="grid grid-cols-12 items-baseline">
            <span className="col-span-3 font-semibold text-amber-900">Họ tên:</span>
            <span className="col-span-9"><span className="font-serif text-sm font-bold text-oriental-crimson">{input.name || 'Lá số tuvidauso.ai.studio'}</span></span>
          </div>
          <div className="grid grid-cols-12 items-baseline">
            <span className="col-span-3 font-semibold text-amber-900">Năm:</span>
            <span className="col-span-9">{solarYearNum} <span className="font-bold text-amber-900">{yearCanChi.label}</span></span>
          </div>
          <div className="grid grid-cols-12 items-baseline">
            <span className="col-span-3 font-semibold text-amber-900">Tháng:</span>
            <span className="col-span-9">{solarMonthNum} <span className="text-stone-500">(ÂL {lunar.month}{lunar.isLeapMonth ? ' nhuận' : ''})</span> <span className="font-semibold">{monthCanChi.label}</span></span>
          </div>
          <div className="grid grid-cols-12 items-baseline">
            <span className="col-span-3 font-semibold text-amber-900">Ngày:</span>
            <span className="col-span-9">{solarDayNum} <span className="text-stone-500">(ÂL {lunar.day})</span> <span className="font-semibold">{dayCanChi.label}</span></span>
          </div>
          <div className="grid grid-cols-12 items-baseline">
            <span className="col-span-3 font-semibold text-amber-900">Giờ:</span>
            <span className="col-span-9">{hourText} <span className="font-semibold">{hourCanChi?.label || 'Chưa xác định'}</span></span>
          </div>
          <div className="grid grid-cols-12 items-baseline border-t border-amber-900/10 pt-1">
            <span className="col-span-3 font-semibold text-amber-900">Năm xem:</span>
            <span className="col-span-9 font-semibold text-amber-900">{viewedYearCanChi.label} ({viewedYear}), {ageNominal} tuổi</span>
          </div>
          <div className="grid grid-cols-12 items-baseline">
            <span className="col-span-3 font-semibold text-amber-900">Âm dương:</span>
            <span className="col-span-9"><span className="font-bold text-blue-700">{genderLabel}</span></span>
          </div>
          <div className="grid grid-cols-12 items-baseline">
            <span className="col-span-3 font-semibold text-amber-900">Bản mệnh:</span>
            <div className="col-span-9">
              <span className={`font-bold ${napAmTextClass}`}>{napAmLabel.split('(')[0]?.trim()}</span>
              <span className="text-stone-400"> — </span>
              <span className={`font-bold ${bureauTextClass}`}>{bureauName}</span>
              {menhCucRelation && (
                <span className="block text-[11px] font-semibold text-emerald-700">({menhCucRelation})</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-12 items-baseline">
            <span className="col-span-3 font-semibold text-amber-900">Cân lượng:</span>
            <span className="col-span-9">3 lượng 4 chỉ</span>
          </div>
          <div className="grid grid-cols-12 items-baseline">
            <span className="col-span-3 font-semibold text-amber-900">Chủ mệnh:</span>
            <span className="col-span-9">{chart.menhChu || 'Lộc Tồn'}</span>
          </div>
          <div className="grid grid-cols-12 items-baseline">
            <span className="col-span-3 font-semibold text-amber-900">Chủ thân:</span>
            <span className="col-span-9">{chart.thanChu || 'Văn Xương'}</span>
          </div>
          <div className="grid grid-cols-12 items-baseline">
            <span className="col-span-3 font-semibold text-amber-900">Lai nhân cung:</span>
            <span className="col-span-9"><span className="font-bold text-oriental-crimson">{laiNhanPalace?.name || 'Tử Tức'}</span></span>
          </div>
        </div>

        {/* CON DẤU TRIỆN ĐỎ */}
        <div className="absolute bottom-2 right-2 z-20">
          <div className="imperial-seal" aria-hidden="true">印</div>
        </div>
      </div>
    </div>
  );
};
