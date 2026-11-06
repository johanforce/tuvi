import React from 'react';
import type { ChartCore, Palace } from '../engine/types.js';
import { BRANCH_NAMES, STEM_NAMES } from '../engine/constants.js';
import { STAR_META } from '../catalog/star-metadata.js';
import { StarLabel } from './StarLabel.js';
import { Sparkles, Compass, Calendar } from 'lucide-react';
import { ReadingPanel } from './ReadingPanel.js';

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

  const MAIN_STAR_IDS = new Set([
    'tu-vi', 'thien-co', 'thai-duong', 'vu-khuc', 'thien-dong', 'liem-trinh',
    'thien-phu', 'thai-am', 'tham-lang', 'cu-mon', 'thien-tuong', 'thien-luong',
    'that-sat', 'pha-quan',
  ]);

  const TABS: { key: 'palace' | 'annual' | 'reading'; label: string; icon: React.ReactNode }[] = [
    { key: 'palace', label: 'Chi tiết Cung & Tam Phương', icon: <Compass className="h-4 w-4" /> },
    { key: 'annual', label: `Sao Lưu Niên ${chart.viewedYear}`, icon: <Calendar className="h-4 w-4" /> },
    { key: 'reading', label: 'Luận giải Gemini', icon: <Sparkles className="h-4 w-4" /> },
  ];

  const relatedCards = [
    { palace: oppositePalace, title: 'Xung chiếu (Đối cung)', tone: 'border-sky-300 bg-sky-50/70 hover:bg-sky-100 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20' },
    { palace: trine1Palace, title: 'Tam hợp 1 (+4 cung)', tone: 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20' },
    { palace: trine2Palace, title: 'Tam hợp 2 (+8 cung)', tone: 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20' },
  ];

  return (
    <div className="paper-card mb-6 w-full p-4 no-print">
      {/* Tabs */}
      <div role="tablist" className="mb-4 flex flex-wrap gap-1.5 border-b border-amber-900/15 pb-2 dark:border-slate-700">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={activeTab === t.key}
            onClick={() => onChangeTab(t.key)}
            className="tab"
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Chi tiết Cung & Tam Phương Tứ Chính */}
      {activeTab === 'palace' && (
        <div>
          {selectedPalace ? (
            <div className="space-y-4">
              <div className="paper-inset flex flex-wrap items-center justify-between gap-2 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-serif text-[18px] font-bold uppercase tracking-wider text-oriental-crimson dark:text-amber-400">
                    Cung {selectedPalace.name}
                  </h4>
                  <span className="text-[14px] font-medium text-stone-700 dark:text-slate-300">
                    ({STEM_NAMES[selectedPalace.stem]} {BRANCH_NAMES[selectedPalace.branch]})
                  </span>
                  {chart.thanBranch === selectedPalace.branch && (
                    <span className="rounded bg-amber-600 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white">
                      THÂN CƯ CUNG NÀY
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-stone-500 dark:text-slate-400">
                  Tổng cộng: {selectedPalace.stars.length} vị trí sao
                </span>
              </div>

              {/* Các sao trong cung */}
              <div>
                <h5 className="mb-2 font-serif text-[13px] font-bold text-amber-900 dark:text-amber-400">Các sao tọa thủ tại cung:</h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPalace.stars.map((s, idx) => (
                    <div
                      key={`${s.id}-${idx}`}
                      className="flex items-center rounded-md border border-amber-900/10 bg-[#fcfaf4] px-2 py-1 shadow-xs"
                    >
                      <StarLabel star={s} branch={s.branch} isMain={MAIN_STAR_IDS.has(s.id)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tam Phương Tứ Chính */}
              <div className="border-t border-amber-900/15 pt-3 dark:border-slate-700">
                <h5 className="mb-2 font-serif text-[13px] font-bold text-amber-900 dark:text-amber-400">
                  Tam Phương Tứ Chính <span className="font-sans font-normal text-stone-500 dark:text-slate-400">(nhấp để chuyển cung xem)</span>
                </h5>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {relatedCards.map(({ palace, title, tone }) =>
                    palace ? (
                      <button
                        key={title}
                        type="button"
                        onClick={() => onSelectBranch(palace.branch)}
                        className={`cursor-pointer rounded-xl border p-3 text-left transition-colors ${tone}`}
                      >
                        <div className="text-[11px] font-bold uppercase tracking-wide">{title}</div>
                        <div className="mt-0.5 text-[13px] font-bold text-stone-900 dark:text-slate-100">
                          Cung {palace.name} ({BRANCH_NAMES[palace.branch]})
                        </div>
                        <div className="mt-1 line-clamp-1 text-[11px] text-stone-500 dark:text-slate-400">
                          {palace.stars.map(s => s.name).join(', ') || 'Vô chính diệu'}
                        </div>
                      </button>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-[13px] text-stone-500 dark:text-slate-400">
              Vui lòng nhấp vào một trong 12 cung trên lá số để xem chi tiết các sao tọa thủ và quan hệ Tam Phương Tứ Chính.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Lớp Sao Lưu Niên */}
      {activeTab === 'annual' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-purple-200 bg-purple-50/80 p-3 dark:border-purple-500/30 dark:bg-purple-500/10">
            <h4 className="font-serif text-[15px] font-bold text-purple-950 dark:text-purple-200">
              Lớp Sao Lưu Niên {chart.viewedYear} ({chart.viewedYearCanChi.label})
            </h4>
            <p className="mt-0.5 text-[12px] text-purple-800 dark:text-purple-300">
              Các sao lưu được tính toán theo Can Chi năm xem và Can năm sinh (v0.2.4).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 text-[12.5px] md:grid-cols-2">
            <div className="rounded-xl border border-amber-900/15 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <span className="mb-1 block font-serif font-bold text-oriental-crimson dark:text-amber-400">Sao lưu chính</span>
              <ul className="space-y-1 text-stone-600 dark:text-slate-300">
                <li>• <strong>Lưu Thái Tuế:</strong> Đóng tại cung {BRANCH_NAMES[chart.viewedYearCanChi.branch]} (trùng Chi năm xem).</li>
                <li>• <strong>Lưu Thiên Không:</strong> Tiến thuận 1 cung từ Thái Tuế năm xem.</li>
                <li>• <strong>Lưu Niên Văn Tinh:</strong> Cố định theo Can năm sinh.</li>
                <li>• <strong>Lưu Văn Xương / Lưu Văn Khúc:</strong> Bảng Trung Châu phái theo Can năm xem.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-900/15 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <span className="mb-1 block font-serif font-bold text-oriental-crimson dark:text-amber-400">Tuần / Triệt &amp; Tứ Hóa lưu</span>
              <ul className="space-y-1 text-stone-600 dark:text-slate-300">
                <li>• <strong>Lưu Tuần Không:</strong> 2 cung khuyết theo Giáp tuần năm xem.</li>
                <li>• <strong>Lưu Triệt Không:</strong> Cặp cung theo Can năm xem.</li>
                <li>• <strong>Lưu Tứ Hóa:</strong> Can năm xem gắn lên các sao gốc tương ứng.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Luận giải AI */}
      {activeTab === 'reading' && <ReadingPanel chart={chart} />}
    </div>
  );
};
