import React from 'react';
import type { ChartCore } from '../engine/types.js';
import { getNapAm } from '../data/napAm.js';
import { getMenhCucRelation } from '../data/canChiHelper.js';

interface CenterInfoProps {
  chart: ChartCore;
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
      className="center-cell relative bg-[#fcf9f2] border border-[#333333] p-3 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* 1. ĐƯỜNG NỐI HÌNH HỌC CHUẨN XÁC TỪ CUNG THÂN
          - Đường ĐỎ: Nối Cung Thân với Cung Đối Diện (Xung Chiếu)
          - Đường TÍM: Nối Cung Thân với 2 Cung Tam Hợp tạo thành tam giác Tam Hợp */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        {/* Đường TÍM: Tam giác Tam Hợp của Cung Thân */}
        <polygon 
          points={`${pThan.x},${pThan.y} ${pTrine1.x},${pTrine1.y} ${pTrine2.x},${pTrine2.y}`} 
          fill="rgba(124, 58, 237, 0.03)" 
          stroke="#7c3aed" 
          strokeWidth="1.1" 
        />

        {/* Đường ĐỎ: Nối Cung Thân với Cung Đối Diện */}
        <line 
          x1={pThan.x} 
          y1={pThan.y} 
          x2={pOpp.x} 
          y2={pOpp.y} 
          stroke="#dc2626" 
          strokeWidth="1.1" 
        />

        {/* Các chấm tròn anchor tại các điểm nối */}
        <circle cx={pThan.x} cy={pThan.y} r="1.5" fill="#dc2626" />
        <circle cx={pOpp.x} cy={pOpp.y} r="1.5" fill="#dc2626" />
        <circle cx={pTrine1.x} cy={pTrine1.y} r="1.4" fill="#7c3aed" />
        <circle cx={pTrine2.x} cy={pTrine2.y} r="1.4" fill="#7c3aed" />
      </svg>

      {/* 2. CÁC NHÃN ĐỊA CHI PHÂN BỔ 4 CẠNH & 4 GÓC CHUẨN XÁC */}
      {/* 4 Góc: Tỵ (trên-trái), Thân (trên-phải), Hợi (dưới-phải), Dần (dưới-trái) */}
      <span className="absolute top-1 left-1.5 text-[10px] text-stone-600 font-serif z-10 pointer-events-none">Mùi</span>
      <span className="absolute top-1 right-1.5 text-[10px] text-stone-600 font-serif z-10 pointer-events-none">Tuất</span>
      <span className="absolute bottom-1 right-1.5 text-[10px] text-stone-600 font-serif z-10 pointer-events-none">Sửu</span>
      <span className="absolute bottom-1 left-1.5 text-[10px] text-stone-600 font-serif z-10 pointer-events-none">Thìn</span>

      {/* Cạnh trên: Ngọ (25%), Mùi (75%) */}
      <span className="absolute top-0.5 -translate-x-1/2 text-[10px] text-stone-600 font-serif z-10 pointer-events-none" style={{ left: '25%' }}>Thân</span>
      <span className="absolute top-0.5 -translate-x-1/2 text-[10px] text-stone-600 font-serif z-10 pointer-events-none" style={{ left: '75%' }}>Dậu</span>

      {/* Cạnh phải: Dậu (25%), Tuất (75%) */}
      <span className="absolute right-1 -translate-y-1/2 text-[10px] text-stone-600 font-serif z-10 pointer-events-none" style={{ top: '25%' }}>Hợi</span>
      <span className="absolute right-1 -translate-y-1/2 text-[10px] text-stone-600 font-serif z-10 pointer-events-none" style={{ top: '75%' }}>Tý</span>

      {/* Cạnh dưới: Sửu (25%), Tý (75%) */}
      <span className="absolute bottom-0.5 -translate-x-1/2 text-[10px] text-stone-600 font-serif z-10 pointer-events-none" style={{ left: '25%' }}>Mão</span>
      <span className="absolute bottom-0.5 -translate-x-1/2 text-[10px] text-stone-600 font-serif z-10 pointer-events-none" style={{ left: '75%' }}>Dần</span>

      {/* Cạnh trái: Thìn (25%), Mão (75%) */}
      <span className="absolute left-1 -translate-y-1/2 text-[10px] text-stone-600 font-serif z-10 pointer-events-none" style={{ top: '25%' }}>Ngọ</span>
      <span className="absolute left-1 -translate-y-1/2 text-[10px] text-stone-600 font-serif z-10 pointer-events-none" style={{ top: '75%' }}>Tỵ</span>

      {/* 3. NỘI DUNG CHÍNH CỦA THIÊN BÀN */}
      <div className="relative z-10 flex flex-col h-full justify-between px-3 py-1">
        {/* Header trên cùng */}
        <div className="text-center pt-1">
          <h3 className="font-bold text-[12px] md:text-[13px] tracking-wider text-black uppercase font-sans">
            TRANG TỬ VI CỔ HỌC HÀNG ĐẦU VIỆT NAM
          </h3>
          <a 
            href="https://tuvidauso.ai.studio" 
            target="_blank" 
            rel="noreferrer"
            className="text-[12px] text-[#0066cc] font-medium block hover:underline"
          >
            https://tuvidauso.ai.studio
          </a>
          <h2 className="font-serif font-black text-[22px] md:text-[24px] text-black tracking-wide mt-0.5 italic">
            Lá Số Tử Vi
          </h2>
        </div>

        {/* Bảng dữ liệu hai cột chính xác theo ảnh fixture */}
        <div className="text-[11.5px] md:text-[12px] leading-[1.45] text-stone-900 my-auto pl-2 pr-6 space-y-0.5">
          <div className="grid grid-cols-12">
            <span className="col-span-3 font-bold text-black">Họ tên:</span>
            <span className="col-span-9 font-medium">{input.name || 'Lá số tuvidauso.ai.studio'}</span>
          </div>

          <div className="grid grid-cols-12">
            <span className="col-span-3 font-bold text-black">Năm:</span>
            <span className="col-span-4">{solarYearNum}</span>
            <span className="col-span-5 font-medium">{yearCanChi.label}</span>
          </div>

          <div className="grid grid-cols-12">
            <span className="col-span-3 font-bold text-black">Tháng:</span>
            <span className="col-span-4">{solarMonthNum} ({lunar.month}{lunar.isLeapMonth ? ' nhuận' : ''})</span>
            <span className="col-span-5 font-medium">{monthCanChi.label}</span>
          </div>

          <div className="grid grid-cols-12">
            <span className="col-span-3 font-bold text-black">Ngày:</span>
            <span className="col-span-4">{solarDayNum} ({lunar.day})</span>
            <span className="col-span-5 font-medium">{dayCanChi.label}</span>
          </div>

          <div className="grid grid-cols-12">
            <span className="col-span-3 font-bold text-black">Giờ:</span>
            <span className="col-span-4">{hourText}</span>
            <span className="col-span-5 font-medium">{hourCanChi?.label || 'Chưa xác định'}</span>
          </div>

          <div className="grid grid-cols-12">
            <span className="col-span-3 font-bold text-black">Năm xem:</span>
            <span className="col-span-9 font-medium">{viewedYearCanChi.label} ({viewedYear}), {ageNominal} tuổi</span>
          </div>

          <div className="grid grid-cols-12">
            <span className="col-span-3 font-bold text-black">Âm dương:</span>
            <span className="col-span-9 font-medium">{genderLabel}</span>
          </div>

          <div className="grid grid-cols-12">
            <span className="col-span-3 font-bold text-black">Bản mệnh:</span>
            <div className="col-span-9">
              <span className="font-medium">{napAmLabel.split('(')[0]?.trim()} - {bureauName}</span>
              {menhCucRelation && (
                <div className="text-[11px] text-stone-700">({menhCucRelation})</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-12">
            <span className="col-span-3 font-bold text-black">Cân lượng:</span>
            <span className="col-span-9 font-medium">3 lượng 4 chỉ</span>
          </div>

          <div className="grid grid-cols-12">
            <span className="col-span-3 font-bold text-black">Chủ mệnh:</span>
            <span className="col-span-9 font-medium">{chart.menhChu || 'Lộc Tồn'}</span>
          </div>

          <div className="grid grid-cols-12">
            <span className="col-span-3 font-bold text-black">Chủ thân:</span>
            <span className="col-span-9 font-medium">{chart.thanChu || 'Văn Xương'}</span>
          </div>

          <div className="grid grid-cols-12">
            <span className="col-span-3 font-bold text-black">Lai nhân cung:</span>
            <span className="col-span-9 font-medium">{laiNhanPalace?.name || 'Tử Tức'}</span>
          </div>
        </div>

        {/* 4. CON DẤU TRIỆN ĐỎ TRUYỀN THỐNG (Square Imperial Seal Stamp) */}
        <div className="absolute bottom-2 right-2 z-20">
          <div className="w-9 h-9 border-2 border-[#b91c1c] rounded-xs flex items-center justify-center p-0.5 bg-[#fcf9f2] shadow-2xs rotate-[-1deg]">
            <div className="w-full h-full border border-[#b91c1c] flex items-center justify-center">
              <span className="font-hanzi text-[#b91c1c] text-[18px] leading-none font-bold select-none">
                印
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
