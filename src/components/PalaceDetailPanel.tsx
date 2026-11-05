import React from 'react';
import type { ChartCore, Palace } from '../engine/types.js';
import { BRANCH_NAMES, STEM_NAMES } from '../engine/constants.js';
import { STAR_META } from '../catalog/star-metadata.js';
import { StarLabel } from './StarLabel.js';
import { Sparkles, Compass, Info, Calendar } from 'lucide-react';

interface PalaceDetailPanelProps {
  chart: ChartCore;
  selectedBranch: number | null;
  activeTab: 'palace' | 'annual' | 'reading';
  onChangeTab: (tab: 'palace' | 'annual' | 'reading') => void;
  onSelectBranch: (branch: number) => void;
}

export const PalaceDetailPanel: React.FC<PalaceDetailPanelProps> = ({
  chart,
  selectedBranch,
  activeTab,
  onChangeTab,
  onSelectBranch,
}) => {
  const palaceByBranch = new Map<number, Palace>();
  for (const p of chart.palaces) {
    palaceByBranch.set(p.branch, p);
  }

  const selectedPalace = selectedBranch !== null ? palaceByBranch.get(selectedBranch) : null;

  // Tam Phương Tứ Chính
  const oppositeBranch = selectedBranch !== null ? (selectedBranch + 6) % 12 : null;
  const trine1Branch = selectedBranch !== null ? (selectedBranch + 4) % 12 : null;
  const trine2Branch = selectedBranch !== null ? (selectedBranch + 8) % 12 : null;

  const oppositePalace = oppositeBranch !== null ? palaceByBranch.get(oppositeBranch) : null;
  const trine1Palace = trine1Branch !== null ? palaceByBranch.get(trine1Branch) : null;
  const trine2Palace = trine2Branch !== null ? palaceByBranch.get(trine2Branch) : null;

  return (
    <div className="w-full bg-[#fdfbf7] border border-[#d8c8b0] rounded-2xl p-4 shadow-sm mb-6 no-print">
      {/* Tabs chuyển đổi góc nhìn */}
      <div className="flex border-b border-[#e2d5c2] pb-2 mb-4 gap-2">
        <button
          onClick={() => onChangeTab('palace')}
          className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'palace'
              ? 'bg-[#8c2d19] text-amber-50 shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Chi tiết Cung & Tam Phương</span>
        </button>

        <button
          onClick={() => onChangeTab('annual')}
          className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'annual'
              ? 'bg-[#8c2d19] text-amber-50 shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Sao Lưu Niên {chart.viewedYear}</span>
        </button>

        <button
          onClick={() => onChangeTab('reading')}
          className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'reading'
              ? 'bg-[#8c2d19] text-amber-50 shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Luận giải (Phase sau)</span>
        </button>
      </div>

      {/* Tab 1: Chi tiết Cung & Tam Phương Tứ Chính */}
      {activeTab === 'palace' && (
        <div>
          {selectedPalace ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2">
                  <h4 className="font-classical font-black text-[18px] uppercase tracking-wider text-[#8c2d19]">
                    Cung {selectedPalace.name}
                  </h4>
                  <span className="text-[14px] font-medium text-stone-700">
                    ({STEM_NAMES[selectedPalace.stem]} {BRANCH_NAMES[selectedPalace.branch]})
                  </span>
                  {chart.thanBranch === selectedPalace.branch && (
                    <span className="bg-[#8c2d19] text-amber-100 text-[11px] font-bold px-2 py-0.5 rounded">
                      THÂN CƯ CUNG NÀY
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-stone-500">
                  Tổng cộng: {selectedPalace.stars.length} vị trí sao
                </span>
              </div>

              {/* Danh sách các sao trong cung */}
              <div>
                <h5 className="font-bold text-[13px] text-stone-800 mb-2">Các sao tọa thủ tại cung:</h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPalace.stars.map((s, idx) => (
                    <div key={`${s.id}-${idx}`} className="flex items-center gap-1">
                      <StarLabel star={s} branch={s.branch} isMain={s.id === 'tu-vi' || s.id === 'thien-co' || s.id === 'thai-duong' || s.id === 'vu-khuc' || s.id === 'thien-dong' || s.id === 'liem-trinh' || s.id === 'thien-phu' || s.id === 'thai-am' || s.id === 'tham-lang' || s.id === 'cu-mon' || s.id === 'thien-tuong' || s.id === 'thien-luong' || s.id === 'that-sat' || s.id === 'pha-quan'} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tam Phương Tứ Chính */}
              <div className="pt-3 border-t border-stone-200">
                <h5 className="font-bold text-[13px] text-stone-800 mb-2">
                  Tam Phương Tứ Chính (Nhấp để chuyển cung xem):
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {oppositePalace && (
                    <button
                      onClick={() => onSelectBranch(oppositePalace.branch)}
                      className="p-2.5 rounded-lg border border-blue-300 bg-blue-50/60 text-left hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <div className="text-[11px] font-bold text-blue-700 uppercase">
                        Xung chiếu (Đối cung)
                      </div>
                      <div className="font-bold text-[13px] text-stone-900 mt-0.5">
                        Cung {oppositePalace.name} ({BRANCH_NAMES[oppositePalace.branch]})
                      </div>
                      <div className="text-[11px] text-stone-500 line-clamp-1 mt-1">
                        {oppositePalace.stars.map(s => s.name).join(', ') || 'Vô chính diệu'}
                      </div>
                    </button>
                  )}

                  {trine1Palace && (
                    <button
                      onClick={() => onSelectBranch(trine1Palace.branch)}
                      className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/60 text-left hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <div className="text-[11px] font-bold text-emerald-700 uppercase">
                        Tam hợp 1 (+4 cung)
                      </div>
                      <div className="font-bold text-[13px] text-stone-900 mt-0.5">
                        Cung {trine1Palace.name} ({BRANCH_NAMES[trine1Palace.branch]})
                      </div>
                      <div className="text-[11px] text-stone-500 line-clamp-1 mt-1">
                        {trine1Palace.stars.map(s => s.name).join(', ') || 'Vô chính diệu'}
                      </div>
                    </button>
                  )}

                  {trine2Palace && (
                    <button
                      onClick={() => onSelectBranch(trine2Palace.branch)}
                      className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/60 text-left hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <div className="text-[11px] font-bold text-emerald-700 uppercase">
                        Tam hợp 2 (+8 cung)
                      </div>
                      <div className="font-bold text-[13px] text-stone-900 mt-0.5">
                        Cung {trine2Palace.name} ({BRANCH_NAMES[trine2Palace.branch]})
                      </div>
                      <div className="text-[11px] text-stone-500 line-clamp-1 mt-1">
                        {trine2Palace.stars.map(s => s.name).join(', ') || 'Vô chính diệu'}
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-stone-500 text-[13px]">
              Vui lòng nhấp vào một trong 12 cung trên lá số để xem chi tiết các sao tọa thủ và quan hệ Tam Phương Tứ Chính.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Lớp Sao Lưu Niên */}
      {activeTab === 'annual' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-purple-50 p-3 rounded-xl border border-purple-200">
            <div>
              <h4 className="font-bold text-[15px] text-purple-950">
                Lớp Sao Lưu Niên {chart.viewedYear} ({chart.viewedYearCanChi.label})
              </h4>
              <p className="text-[12px] text-purple-800 mt-0.5">
                Các sao lưu được tính toán theo Can Chi năm xem và Can năm sinh (v0.2.4).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12.5px]">
            <div className="border border-stone-200 rounded-lg p-3 bg-white">
              <span className="font-bold text-stone-800 block mb-1">Sao lưu chính:</span>
              <ul className="space-y-1 text-stone-600">
                <li>• <strong>Lưu Thái Tuế:</strong> Đóng tại cung {BRANCH_NAMES[chart.viewedYearCanChi.branch]} (trùng Chi năm xem).</li>
                <li>• <strong>Lưu Thiên Không:</strong> Tiến thuận 1 cung từ Thái Tuế năm xem.</li>
                <li>• <strong>Lưu Niên Văn Tinh:</strong> Cố định theo Can năm sinh.</li>
                <li>• <strong>Lưu Văn Xương / Lưu Văn Khúc:</strong> Bảng Trung Châu phái theo Can năm xem.</li>
              </ul>
            </div>

            <div className="border border-stone-200 rounded-lg p-3 bg-white">
              <span className="font-bold text-stone-800 block mb-1">Tuần / Triệt & Tứ Hóa lưu:</span>
              <ul className="space-y-1 text-stone-600">
                <li>• <strong>Lưu Tuần Không:</strong> 2 cung khuyết theo Giáp tuần năm xem.</li>
                <li>• <strong>Lưu Triệt Không:</strong> Cặp cung theo Can năm xem.</li>
                <li>• <strong>Lưu Tứ Hóa:</strong> Can năm xem gắn lên các sao gốc tương ứng.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Luận giải (Phase sau theo lời dặn của user) */}
      {activeTab === 'reading' && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-full bg-amber-100 text-amber-800 mb-1">
            <Info className="w-5 h-5" />
          </div>
          <h4 className="font-classical font-bold text-[16px] text-[#8c2d19]">
            Phần Luận Giải Đang Được Để Dành Cho Giai Đoạn Tiếp Theo
          </h4>
          <p className="text-[13px] text-stone-600 max-w-xl mx-auto leading-relaxed">
            Theo đúng định hướng phát triển của dự án, giai đoạn hiện tại tập trung hoàn thiện tuyệt đối thuật toán an sao, đối chiếu fixture chuẩn xác với Tuvi.vn, phân tầng sao lưu và tối ưu xuất PDF lưu trữ. Module luận giải tổng quan trọn đời và vận hạn từng năm sẽ được tích hợp ở Phase sau.
          </p>
        </div>
      )}
    </div>
  );
};
