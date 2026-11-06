import React from 'react';
import { Compass, Sparkles, Download } from 'lucide-react';

interface HeaderProps { onNewChart?: () => void; onExportPdf?: () => void; showNewButton?: boolean }

export const Header: React.FC<HeaderProps> = ({ onNewChart, onExportPdf, showNewButton = false }) => (
  <header className="site-header no-print">
    <div className="site-header-inner">
      <div className="brand-lockup">
        <div className="brand-mark"><Compass size={25} /></div>
        <div>
          <h1>TỬ VI CỔ HỌC ĐƯƠNG ĐẠI</h1>
          <p>HUYỀN KHÔNG TINH DIỆU <span>•</span> CHUẨN HÓA CỔ BẢN</p>
        </div>
      </div>
      <nav className="main-nav" aria-label="Điều hướng chính">
        <a className="active" href="#la-so"><Compass size={15}/> Lá Số Chi Tiết</a>
        <a href="#dien-giai"><Sparkles size={15}/> Bình Giải</a>
        <a href="#la-so">Lưu Niên</a>
        <a href="#la-so">Tứ Hóa Cục</a>
      </nav>
      <div className="header-actions">
        {showNewButton && onNewChart && <button className="header-secondary" onClick={onNewChart}>Lập Số Mới</button>}
        <button className="header-primary" onClick={onExportPdf ?? (() => window.print())}><Download size={16}/> Lưu &amp; Xuất PDF</button>
      </div>
    </div>
  </header>
);
