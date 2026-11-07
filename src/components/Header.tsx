import React from 'react';
import { Plus } from 'lucide-react';
import { BrandSeal } from './BrandSeal.js';

interface HeaderProps {
  onNewChart?: () => void;
  onHome?: () => void;
  showNewButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNewChart, onHome, showNewButton = false }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md no-print">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Thương hiệu */}
        <button type="button" onClick={onHome} aria-label="Về trang chủ" title="Về trang chủ" className="flex cursor-pointer items-center gap-3.5 text-left">
          <BrandSeal />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
              Tử Vi Cổ Học
            </h1>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
              Định số trong tinh không, thông tỏ vạn biến thiên cơ một đời người.
            </p>
          </div>
        </button>

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
