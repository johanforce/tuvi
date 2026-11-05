import React from 'react';
import { Download, Printer, RotateCcw, ZoomIn, ZoomOut, Maximize2, Filter, Loader2 } from 'lucide-react';
import type { StarVisibilityFilters } from '../types/chartUI.js';

interface ChartToolbarProps {
  onBack: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  isExportingPdf: boolean;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  filters: StarVisibilityFilters;
  onToggleFilter: (key: keyof StarVisibilityFilters) => void;
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  onBack,
  onExportPdf,
  onPrint,
  isExportingPdf,
  zoom,
  onZoomChange,
  filters,
  onToggleFilter,
}) => {
  return (
    <div className="w-full bg-[#fdfbf7] border border-[#d8c8b0] rounded-xl p-3 shadow-xs mb-4 flex flex-wrap items-center justify-between gap-3 no-print">
      {/* Nút hành động chính */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-stone-700 bg-white border border-[#d8c8b0] rounded-lg hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-stone-500" />
          <span>Lập lá số mới</span>
        </button>

        {/* Nút Xuất PDF trực tiếp */}
        <button
          onClick={onExportPdf}
          disabled={isExportingPdf}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold text-amber-50 bg-[#8c2d19] hover:bg-[#722313] border border-[#8c2d19] rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          title="Tải về file PDF khổ A4 ngang độ nét cao"
        >
          {isExportingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang kết xuất PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Xuất PDF lưu trữ</span>
            </>
          )}
        </button>

        {/* Nút In ấn trực tiếp */}
        <button
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-stone-800 bg-amber-50/80 hover:bg-amber-100/90 border border-amber-300 rounded-lg transition-colors shadow-2xs cursor-pointer"
          title="Mở trình in ấn trình duyệt (Save to PDF hoặc in máy in)"
        >
          <Printer className="w-4 h-4 text-amber-800" />
          <span>In lá số (A4)</span>
        </button>
      </div>

      {/* Bộ lọc hiển thị nhóm sao */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-[12px] text-stone-500 mr-1 hidden sm:flex">
          <Filter className="w-3.5 h-3.5" />
          <span>Lọc sao:</span>
        </div>

        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium bg-white border border-[#d8c8b0] rounded-md cursor-pointer hover:bg-stone-50">
          <input
            type="checkbox"
            checked={filters.main}
            onChange={() => onToggleFilter('main')}
            className="rounded text-amber-700 focus:ring-amber-500"
          />
          <span>Chính tinh</span>
        </label>

        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium bg-white border border-[#d8c8b0] rounded-md cursor-pointer hover:bg-stone-50">
          <input
            type="checkbox"
            checked={filters.secondary}
            onChange={() => onToggleFilter('secondary')}
            className="rounded text-amber-700 focus:ring-amber-500"
          />
          <span>Phụ tinh</span>
        </label>

        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium bg-white border border-[#d8c8b0] rounded-md cursor-pointer hover:bg-stone-50">
          <input
            type="checkbox"
            checked={filters.transformation}
            onChange={() => onToggleFilter('transformation')}
            className="rounded text-amber-700 focus:ring-amber-500"
          />
          <span>Tứ Hóa</span>
        </label>

        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium bg-white border border-[#d8c8b0] rounded-md cursor-pointer hover:bg-stone-50">
          <input
            type="checkbox"
            checked={filters.annual}
            onChange={() => onToggleFilter('annual')}
            className="rounded text-amber-700 focus:ring-amber-500"
          />
          <span className="text-purple-900 font-semibold">Sao Lưu</span>
        </label>

        {/* Nút phóng to / thu nhỏ */}
        <div className="flex items-center border border-[#d8c8b0] rounded-lg overflow-hidden bg-white ml-2">
          <button
            onClick={() => onZoomChange(Math.max(0.6, zoom - 0.1))}
            className="p-1.5 hover:bg-stone-100 text-stone-600 transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-semibold px-2 text-stone-700">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}
            className="p-1.5 hover:bg-stone-100 text-stone-600 transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => onZoomChange(1.0)}
            className="p-1.5 hover:bg-stone-100 text-stone-600 border-l border-[#d8c8b0] transition-colors"
            title="Khôi phục chuẩn 100%"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
