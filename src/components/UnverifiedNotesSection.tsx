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

  const getCategoryBadge = (cat: UnverifiedStarInfo['category']) => {
    switch (cat) {
      case 'conflict':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Mâu thuẫn trường phái
          </span>
        );
      case 'annual_candidate':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 border border-purple-300 px-2 py-0.5 rounded-full">
            <HelpCircle className="w-3 h-3 text-purple-600" />
            Ứng viên sao lưu v0.2.4
          </span>
        );
      case 'brightness_unverified':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 bg-stone-100 border border-stone-300 px-2 py-0.5 rounded-full">
            <HelpCircle className="w-3 h-3 text-stone-500" />
            Độ sáng chưa kiểm chứng
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            Công thức ứng viên
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#fdfbf7] border-2 border-[#b8a082] rounded-2xl p-5 md:p-6 shadow-md mt-6 print-hide">
      {/* Header phần ghi chú */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#e2d5c2] pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-700" />
            <h3 className="font-classical font-black text-[18px] uppercase tracking-wider text-[#8c2d19]">
              BẢNG GHI CHÚ CÁC SAO CHƯA ĐƯỢC KIỂM CHỨNG TRÊN LÁ SỐ
            </h3>
          </div>
          <p className="text-[13px] text-stone-600 mt-1">
            Minh bạch học thuật theo yêu cầu dự án: Toàn bộ sao mang tính ứng viên, mâu thuẫn trường phái hoặc chưa đối chiếu đa fixture được lưu ý chi tiết dưới đây.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[12px] bg-amber-50 text-amber-900 px-3 py-1.5 rounded-lg border border-amber-200">
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span>Chuẩn đối chiếu: <strong>Tuvi.vn</strong></span>
        </div>
      </div>

      {/* Bộ lọc danh mục */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-lg border transition-colors cursor-pointer ${
              selectedCategory === cat.key
                ? 'bg-[#8c2d19] text-amber-50 border-[#8c2d19] shadow-xs'
                : 'bg-white text-stone-700 border-[#d8c8b0] hover:bg-stone-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Danh sách các sao và chi tiết */}
      <div className="space-y-2.5">
        {filteredStars.map(item => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="border border-[#e2d5c2] rounded-xl bg-white overflow-hidden shadow-2xs transition-shadow hover:shadow-xs"
            >
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full flex items-center justify-between p-3.5 text-left bg-stone-50/50 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="font-bold text-[14px] text-stone-900">
                    {item.name}
                  </span>
                  {getCategoryBadge(item.category)}
                  <span className="text-[12px] text-stone-500 line-clamp-1">
                    {item.reason}
                  </span>
                </div>
                <div className="text-stone-400 ml-2">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 border-t border-[#e2d5c2] bg-[#fffdfa] text-[13px] leading-relaxed text-stone-700 space-y-2">
                  <div>
                    <strong className="text-stone-900">Thực trạng công thức: </strong>
                    {item.details}
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[12px] text-stone-500 border-t border-stone-100">
                    <span className="font-semibold text-stone-600">Nguồn trích dẫn / Căn cứ:</span>
                    <span className="italic">{item.sourceNote}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chú thích ngũ hành & ký hiệu */}
      <div className="mt-5 pt-4 border-t border-[#e2d5c2] flex flex-wrap items-center justify-between gap-3 text-[12px] text-stone-600">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-stone-800">Quy ước màu ngũ hành sao:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Kim</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-800"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Mộc</span>
          <span className="inline-flex items-center gap-1 font-semibold text-blue-900"><span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span> Thủy</span>
          <span className="inline-flex items-center gap-1 font-semibold text-red-700"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Hỏa</span>
          <span className="inline-flex items-center gap-1 font-semibold text-amber-800"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Thổ</span>
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
