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

const FILTER_ITEMS: { key: keyof StarVisibilityFilters; label: string }[] = [
  { key: 'main', label: 'Chính tinh' },
  { key: 'secondary', label: 'Phụ tinh' },
  { key: 'transformation', label: 'Tứ Hóa' },
  { key: 'annual', label: 'Sao Lưu' },
];

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
    <div className="paper-card mb-4 flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 no-print">
      {/* Hành động chính */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onBack} className="btn btn-outline">
          <RotateCcw className="h-4 w-4" />
          <span>Lập lá số mới</span>
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExportingPdf}
          className="btn btn-primary"
          title="Tải về file PDF khổ A4 ngang độ nét cao"
        >
          {isExportingPdf ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang kết xuất PDF...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Xuất PDF lưu trữ</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="btn btn-outline"
          title="Mở trình in ấn trình duyệt (Save to PDF hoặc in máy in)"
        >
          <Printer className="h-4 w-4" />
          <span>In lá số (A4)</span>
        </button>
      </div>

      {/* Bộ lọc + zoom */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-1 hidden items-center gap-1.5 text-[12px] font-semibold text-amber-900 dark:text-amber-400 sm:flex">
          <Filter className="h-3.5 w-3.5" />
          <span className="font-serif">Lọc sao:</span>
        </div>

        {FILTER_ITEMS.map(({ key, label }) => (
          <label key={key} className="chip" data-active={filters[key]}>
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={() => onToggleFilter(key)}
              className="h-3.5 w-3.5 rounded border-red-300 text-red-800 focus:ring-red-600"
            />
            <span>{label}</span>
          </label>
        ))}

        <div className="ml-1 flex items-center overflow-hidden rounded-lg border border-amber-300/60 bg-white/80 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.6, zoom - 0.1))}
            className="cursor-pointer p-1.5 text-amber-900 transition-colors hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-slate-700"
            title="Thu nhỏ"
            aria-label="Thu nhỏ"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="min-w-[3rem] text-center text-[11px] font-bold tabular-nums text-stone-700 dark:text-slate-200">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}
            className="cursor-pointer p-1.5 text-amber-900 transition-colors hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-slate-700"
            title="Phóng to"
            aria-label="Phóng to"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(1.0)}
            className="cursor-pointer border-l border-amber-300/60 p-1.5 text-amber-900 transition-colors hover:bg-amber-100 dark:border-slate-700 dark:text-amber-300 dark:hover:bg-slate-700"
            title="Khôi phục chuẩn 100%"
            aria-label="Khôi phục chuẩn 100%"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
