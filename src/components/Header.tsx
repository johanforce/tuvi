import React from 'react';
import { Compass } from 'lucide-react';

interface HeaderProps {
  onNewChart?: () => void;
  showNewButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNewChart, showNewButton = false }) => {
  return (
    <header className="w-full bg-[#fcf8ee] border-b border-[#d8c8b0] py-3.5 px-4 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8c2d19] flex items-center justify-center text-amber-100 shadow-xs border border-[#722313]">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-classical font-black text-xl md:text-2xl tracking-wide text-[#8c2d19] uppercase">
              TỬ VI ĐẨU SỐ
            </h1>
            <p className="text-[12px] text-stone-500 font-medium">
              Sơ Đồ Địa Bàn 4x4 • Phân Tầng Sao Lưu • Múi Giờ Việt Nam (UTC+7)
            </p>
          </div>
        </div>

        {showNewButton && onNewChart && (
          <button
            onClick={onNewChart}
            className="px-3.5 py-1.5 text-[13px] font-semibold text-[#8c2d19] bg-amber-50 hover:bg-amber-100 border border-[#8c2d19]/30 rounded-lg transition-colors cursor-pointer"
          >
            Lập lá số mới
          </button>
        )}
      </div>
    </header>
  );
};
