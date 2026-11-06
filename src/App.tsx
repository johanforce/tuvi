import React, { useState } from 'react';
import { Header } from './components/Header.js';
import { BirthForm } from './components/BirthForm.js';
import { ChartGrid } from './components/ChartGrid.js';
import { ChartToolbar } from './components/ChartToolbar.js';
import { PalaceDetailPanel } from './components/PalaceDetailPanel.js';
import { UnverifiedNotesSection } from './components/UnverifiedNotesSection.js';
import { buildChart } from './engine/build-chart.js';
import type { BirthInput, ChartCore } from './engine/types.js';
import type { StarVisibilityFilters } from './types/chartUI.js';
import { exportChartToPdf, printChart } from './utils/pdfExport.js';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'form' | 'chart'>('form');
  const [currentInput, setCurrentInput] = useState<BirthInput>({
    name: 'Nguyễn Văn Tuệ',
    gender: 'nam',
    solarDate: '1999-07-06',
    hour: 10,
    minute: 30,
    viewedYear: 2026,
  });

  const [chart, setChart] = useState<ChartCore | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'palace' | 'annual' | 'reading'>('palace');
  const [zoom, setZoom] = useState<number>(1.0);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [filters, setFilters] = useState<StarVisibilityFilters>({
    main: true,
    secondary: true,
    transformation: true,
    annual: true,
  });

  // Xử lý tạo lá số
  const handleBuildChart = (input: BirthInput) => {
    try {
      const generatedChart = buildChart(input);
      setChart(generatedChart);
      setCurrentInput(input);
      // Mặc định chọn cung Mệnh nếu có, ngược lại chọn cung Dần (2)
      setSelectedBranch(generatedChart.menhBranch !== undefined ? generatedChart.menhBranch : 2);
      setView('chart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('Lỗi tính lá số:', err);
      alert(err instanceof Error ? err.message : 'Lỗi khi tính toán lá số Tử Vi');
    }
  };

  const handleToggleFilter = (key: keyof StarVisibilityFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Xuất file PDF độ nét cao
  const handleExportPdf = () => {
    if (!chart) return;
    const cleanName = (chart.input.name || 'La_So')
      .replace(/[\s\W]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const fileName = `La_So_Tu_Vi_${cleanName}_${chart.yearCanChi.label.replace(/\s+/g, '_')}.pdf`;

    exportChartToPdf({
      elementId: 'tuvi-chart-container',
      fileName,
      onStart: () => setIsExportingPdf(true),
      onFinish: () => setIsExportingPdf(false),
      onError: (err) => {
        setIsExportingPdf(false);
        alert(`Không thể xuất PDF: ${err.message}. Bạn có thể dùng tính năng "In lá số" để lưu dạng PDF.`);
      },
    });
  };

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Header
        onNewChart={() => setView('form')}
        onExportPdf={handleExportPdf}
        showNewButton={view === 'chart'}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-2 md:px-6 py-6">
        {view === 'form' && (
          <BirthForm
            initialValues={currentInput}
            onSubmit={handleBuildChart}
          />
        )}

        {view === 'chart' && chart && (
          <div className="space-y-4 print-area">
            {/* Thanh công cụ: nút xuất PDF, in, zoom, lọc sao, lập lá số mới */}
            <ChartToolbar
              onBack={() => setView('form')}
              onExportPdf={handleExportPdf}
              onPrint={printChart}
              isExportingPdf={isExportingPdf}
              zoom={zoom}
              onZoomChange={setZoom}
              filters={filters}
              onToggleFilter={handleToggleFilter}
            />

            {/* Các cảnh báo/lưu ý thuật toán nếu có (VD: sinh tháng nhuận, không rõ giờ, v.v.) */}
            {chart.warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-[12.5px] text-amber-900 no-print">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Lưu ý đặc biệt từ engine tính toán:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                  {chart.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Khung bàn cờ lá số 4x4 truyền thống */}
            <div id="la-so" className="chart-shell w-full border rounded-2xl shadow-xl p-2 md:p-4 overflow-hidden">
              <ChartGrid
                chart={chart}
                selectedBranch={selectedBranch}
                onSelectPalace={setSelectedBranch}
                filters={filters}
                zoom={zoom}
              />
            </div>

            {/* Panel chi tiết cung được chọn & Tam Phương Tứ Chính */}
            <PalaceDetailPanel
              chart={chart}
              selectedBranch={selectedBranch}
              activeTab={activeDetailTab}
              onChangeTab={setActiveDetailTab}
              onSelectBranch={setSelectedBranch}
            />

            {/* QUAN TRỌNG THEO YÊU CẦU CỦA USER:
                "lưu ý các sao nào chưa được kiểm chứng thì note lại bên dưới lá số tử vi gíup tôi" */}
            <div id="dien-giai"><UnverifiedNotesSection /></div>
          </div>
        )}
      </main>

      {/* Footer bản quyền */}
      <footer className="w-full bg-[#fcf8ee] border-t border-[#d8c8b0] py-4 text-center text-[12px] text-stone-500 no-print">
        <p>Hệ Thống Lập Lá Số Tử Vi • Bố Cục Địa Bàn 4x4 • Đối Chiếu Đa Fixture tuvidauso.ai.studio</p>
      </footer>
    </div>
  );
}
