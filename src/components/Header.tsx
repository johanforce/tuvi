import React from 'react';
import { Compass, Plus } from 'lucide-react';

interface HeaderProps {
  onNewChart?: () => void;
  showNewButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNewChart, showNewButton = false }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md no-print">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Thương hiệu */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-amber-700 to-oriental-gold text-white shadow-md shadow-amber-900/20">
            <Compass className="h-6 w-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
              Tử Vi Đẩu Số
            </h1>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
              Địa Bàn 4×4 • Phân Tầng Sao Lưu • UTC+7
            </p>
          </div>
        </div>

        {/* Hành động */}
        <div className="flex items-center gap-2.5">
          {showNewButton && onNewChart && (
            <button type="button" onClick={onNewChart} className="btn btn-primary">
              <Plus className="h-4 w-4" />
              Lập lá số mới
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
