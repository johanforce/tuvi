import React, { useState } from 'react';
import { UNVERIFIED_STARS_LIST, UnverifiedStarInfo } from '../data/unverifiedStars.js';
import { AlertTriangle, HelpCircle, ShieldAlert, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export const UnverifiedNotesSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('hoa-linh');

  const categories = [
    { key: 'all', label: 'Tất cả ghi chú (9 nhóm)' },
    { key: 'conflict', label: 'Mâu thuẫn trường phái (3)' },
    { key: 'candidate_spec', label: 'Công thức ứng viên (3)' },
    { key: 'candidate_iztro', label: 'Tham khảo Iztro (1)' },
    { key: 'annual_candidate', label: 'Sao lưu niên (1)' },
    { key: 'brightness_unverified', label: 'Độ sáng sao (1)' },
  ];

  const filteredStars = selectedCategory === 'all'
    ? UNVERIFIED_STARS_LIST
    : UNVERIFIED_STARS_LIST.filter(s => s.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const BADGE_BASE = 'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold';

  const getCategoryBadge = (cat: UnverifiedStarInfo['category']) => {
    switch (cat) {
      case 'conflict':
        return (
          <span className={`${BADGE_BASE} border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300`}>
            <AlertTriangle className="h-3 w-3 text-rose-600" />
            Mâu thuẫn trường phái
          </span>
        );
      case 'annual_candidate':
        return (
          <span className={`${BADGE_BASE} border-purple-300 bg-purple-50 text-purple-800 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-300`}>
            <HelpCircle className="h-3 w-3 text-purple-600" />
            Ứng viên sao lưu v0.2.4
          </span>
        );
      case 'brightness_unverified':
        return (
          <span className={`${BADGE_BASE} border-stone-300 bg-stone-100 text-stone-700 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300`}>
            <HelpCircle className="h-3 w-3 text-stone-500" />
            Độ sáng chưa kiểm chứng
          </span>
        );
      default:
        return (
          <span className={`${BADGE_BASE} border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300`}>
            <ShieldAlert className="h-3 w-3 text-amber-600" />
            Công thức ứng viên
          </span>
        );
    }
  };

  return (
    <div className="paper-card-double print-hide mt-6 w-full p-5 md:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col justify-between gap-3 border-b border-amber-900/15 pb-4 dark:border-slate-700 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-amber-700 dark:text-amber-400" />
            <h3 className="font-serif text-[17px] font-bold uppercase tracking-wider text-oriental-crimson dark:text-amber-400">
              Bảng ghi chú các sao chưa được kiểm chứng
            </h3>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-stone-600 dark:text-slate-300">
            Minh bạch học thuật theo yêu cầu dự án: Toàn bộ sao mang tính ứng viên, mâu thuẫn trường phái hoặc chưa đối chiếu đa fixture được lưu ý chi tiết dưới đây.
          </p>
        </div>

        <div className="paper-inset flex shrink-0 items-center gap-2 px-3 py-1.5 text-[12px] text-amber-900 dark:text-amber-300">
          <BookOpen className="h-4 w-4 text-amber-700 dark:text-amber-400" />
          <span>Chuẩn đối chiếu: <strong>tuvidauso.ai.studio</strong></span>
        </div>
      </div>

      {/* Bộ lọc danh mục */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {categories.map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className="chip"
            data-active={selectedCategory === cat.key}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Danh sách */}
      <div className="space-y-2.5">
        {filteredStars.map(item => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-amber-900/15 bg-white/70 shadow-xs transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60"
            >
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                aria-expanded={isExpanded}
                className="flex w-full cursor-pointer items-center justify-between bg-amber-50/40 p-3.5 text-left transition-colors hover:bg-amber-50 dark:bg-transparent dark:hover:bg-slate-700/50"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <span className="font-serif text-[14.5px] font-bold text-stone-900 dark:text-slate-100">
                    {item.name}
                  </span>
                  {getCategoryBadge(item.category)}
                  <span className="line-clamp-1 text-[12px] text-stone-500 dark:text-slate-400">
                    {item.reason}
                  </span>
                </div>
                <div className="ml-2 text-amber-700 dark:text-amber-400">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="space-y-2 border-t border-amber-900/15 bg-[#fffdf8] p-4 text-[13px] leading-relaxed text-stone-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                  <div>
                    <strong className="text-oriental-crimson dark:text-amber-400">Thực trạng công thức: </strong>
                    {item.details}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-amber-900/20 pt-2 text-[12px] text-stone-500 dark:border-slate-700 dark:text-slate-400">
                    <span className="font-semibold text-amber-900 dark:text-amber-300">Nguồn trích dẫn / Căn cứ:</span>
                    <span className="italic">{item.sourceNote}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chú thích */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-amber-900/15 pt-4 text-[12px] text-stone-600 dark:border-slate-700 dark:text-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-serif font-bold text-stone-800 dark:text-slate-100">Quy ước màu ngũ hành sao:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-element-kim"><span className="h-2.5 w-2.5 rounded-full bg-element-kim" /> Kim</span>
          <span className="inline-flex items-center gap-1 font-semibold text-element-moc"><span className="h-2.5 w-2.5 rounded-full bg-element-moc" /> Mộc</span>
          <span className="inline-flex items-center gap-1 font-semibold text-element-thuy"><span className="h-2.5 w-2.5 rounded-full bg-element-thuy" /> Thủy</span>
          <span className="inline-flex items-center gap-1 font-semibold text-element-hoa"><span className="h-2.5 w-2.5 rounded-full bg-element-hoa" /> Hỏa</span>
          <span className="inline-flex items-center gap-1 font-semibold text-element-tho"><span className="h-2.5 w-2.5 rounded-full bg-element-tho" /> Thổ</span>
        </div>
        <div className="flex items-center gap-3">
          <span><strong>(?)</strong>: Độ sáng chưa kiểm chứng</span>
          <span><strong>L.</strong>: Sao lưu niên</span>
          <span><strong>•</strong>: Sao mang tính ứng viên</span>
        </div>
      </div>
    </div>
  );
};
