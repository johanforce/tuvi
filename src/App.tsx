import React, { useCallback, useEffect, useState } from 'react';
import { Header } from './components/Header.js';
import { BirthForm } from './components/BirthForm.js';
import { ChartGrid } from './components/ChartGrid.js';
import { ChartToolbar } from './components/ChartToolbar.js';
import { PalaceDetailPanel } from './components/PalaceDetailPanel.js';
import { BacDeTab } from './components/BacDeTab.js';
import { LunarCalendarTab } from './components/LunarCalendarTab.js';
import { TangThuTab } from './components/TangThuTab.js';
import { BrandSeal } from './components/BrandSeal.js';
import { buildChart } from './engine/build-chart.js';
import type { BirthInput, ChartCore } from './engine/types.js';
import type { StarVisibilityFilters } from './types/chartUI.js';
import { exportChartToPdf, printChart } from './utils/pdfExport.js';
import { AlertCircle, BookOpen, CalendarDays, Compass, BookMarked } from 'lucide-react';

const LAST_CHART_INPUT_KEY = 'tuvi-last-chart-input-v1';

const DEFAULT_INPUT: BirthInput = {
  name: 'Nguyễn Văn Tuệ',
  gender: 'nam',
  solarDate: '1999-07-06',
  hour: 10,
  minute: 30,
  viewedYear: 2026,
};

type AppPage = 'form' | 'chart' | 'bacde' | 'calendar' | 'tangthu';
type DetailTab = 'palace' | 'annual' | 'reading';

interface RestoredPage {
  view: AppPage;
  input: BirthInput;
  chart: ChartCore | null;
  selectedBranch: number | null;
  activeDetailTab: DetailTab;
  bacDeNumber: number;
  showBacDeResult: boolean;
  calendarDate: string;
}

function todayIsoDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function isValidCalendarDate(value: string | null): value is string {
  if (!value) return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return year >= 1900 && year <= 2100 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function loadLastChartInput(): BirthInput | null {
  try {
    const raw = localStorage.getItem(LAST_CHART_INPUT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<BirthInput>;
    if ((value.gender !== 'nam' && value.gender !== 'nu') || typeof value.solarDate !== 'string') return null;
    const input: BirthInput = {
      gender: value.gender,
      solarDate: value.solarDate,
      ...(typeof value.hour === 'number' ? { hour: value.hour } : {}),
      ...(typeof value.minute === 'number' ? { minute: value.minute } : {}),
      ...(value.unknownTime === true ? { unknownTime: true } : {}),
      ...(typeof value.viewedYear === 'number' ? { viewedYear: value.viewedYear } : {}),
    };
    buildChart(input);
    return input;
  } catch {
    return null;
  }
}

function readUrlPage(): RestoredPage | null {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');
  if (page !== 'form' && page !== 'chart' && page !== 'bacde' && page !== 'calendar' && page !== 'tangthu') return null;

  if (page === 'tangthu') {
    return {
      view: 'tangthu', input: DEFAULT_INPUT, chart: null, selectedBranch: null, activeDetailTab: 'palace',
      bacDeNumber: 1, showBacDeResult: false,
      calendarDate: todayIsoDate(),
    };
  }

  if (page === 'bacde') {
    const number = Number(params.get('que'));
    return {
      view: 'bacde', input: DEFAULT_INPUT, chart: null, selectedBranch: null, activeDetailTab: 'palace',
      bacDeNumber: Number.isInteger(number) && number >= 1 && number <= 51 ? number : 1,
      showBacDeResult: params.get('result') === '1',
      calendarDate: todayIsoDate(),
    };
  }

  if (page === 'calendar') {
    const selectedDate = params.get('date');
    return {
      view: 'calendar', input: DEFAULT_INPUT, chart: null, selectedBranch: null, activeDetailTab: 'palace',
      bacDeNumber: 1, showBacDeResult: false,
      calendarDate: isValidCalendarDate(selectedDate) ? selectedDate : todayIsoDate(),
    };
  }

  const date = params.get('date');
  const gender = params.get('gender');
  const year = Number(params.get('viewedYear'));
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || (gender !== 'nam' && gender !== 'nu')) {
    return { view: 'form', input: DEFAULT_INPUT, chart: null, selectedBranch: null, activeDetailTab: 'palace', bacDeNumber: 1, showBacDeResult: false, calendarDate: todayIsoDate() };
  }

  const unknownTime = params.get('unknownTime') === '1';
  const parsedHour = params.has('hour') ? Number(params.get('hour')) : undefined;
  const parsedMinute = params.has('minute') ? Number(params.get('minute')) : undefined;
  const input: BirthInput = {
    name: params.get('name') || undefined,
    gender,
    solarDate: date,
    ...(unknownTime && page === 'chart' ? {} : {
      ...(Number.isInteger(parsedHour) && parsedHour! >= 0 && parsedHour! <= 23 ? { hour: parsedHour } : {}),
      ...(Number.isInteger(parsedMinute) && parsedMinute! >= 0 && parsedMinute! <= 59 ? { minute: parsedMinute } : {}),
    }),
    unknownTime,
    viewedYear: Number.isInteger(year) && year >= 1900 && year <= 2100 ? year : DEFAULT_INPUT.viewedYear,
  };

  if (page === 'form') {
    return { view: 'form', input, chart: null, selectedBranch: null, activeDetailTab: 'palace', bacDeNumber: 1, showBacDeResult: false, calendarDate: todayIsoDate() };
  }

  try {
    const chart = buildChart(input);
    const branch = params.has('palace') ? Number(params.get('palace')) : Number.NaN;
    const tab = params.get('tab');
    return {
      view: 'chart',
      input,
      chart,
      selectedBranch: Number.isInteger(branch) && branch >= 0 && branch < 12 ? branch : chart.menhBranch ?? 2,
      activeDetailTab: tab === 'annual' || tab === 'reading' ? tab : 'palace',
      bacDeNumber: 1,
      showBacDeResult: false,
      calendarDate: todayIsoDate(),
    };
  } catch {
    return { view: 'form', input, chart: null, selectedBranch: null, activeDetailTab: 'palace', bacDeNumber: 1, showBacDeResult: false, calendarDate: todayIsoDate() };
  }
}

function writePageUrl(view: AppPage, input: BirthInput, options: {
  selectedBranch?: number | null;
  activeDetailTab?: DetailTab;
  bacDeNumber?: number;
  showBacDeResult?: boolean;
  calendarDate?: string;
  replace?: boolean;
} = {}) {
  const params = new URLSearchParams();
  params.set('page', view);
  if (view === 'bacde') {
    if (options.bacDeNumber !== undefined) params.set('que', String(options.bacDeNumber));
    if (options.showBacDeResult) params.set('result', '1');
    const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    if (options.replace) window.history.replaceState({}, '', url);
    else window.history.pushState({}, '', url);
    return;
  }
  if (view === 'calendar') {
    if (options.calendarDate) params.set('date', options.calendarDate);
    const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    if (options.replace) window.history.replaceState({}, '', url);
    else window.history.pushState({}, '', url);
    return;
  }
  if (view === 'tangthu') {
    const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    if (options.replace) window.history.replaceState({}, '', url);
    else window.history.pushState({}, '', url);
    return;
  }
  if (input.name) params.set('name', input.name);
  params.set('gender', input.gender);
  params.set('date', input.solarDate);
  if (input.unknownTime) {
    params.set('unknownTime', '1');
  }
  if (input.hour !== undefined) params.set('hour', String(input.hour));
  if (input.minute !== undefined) params.set('minute', String(input.minute));
  if (input.viewedYear !== undefined) params.set('viewedYear', String(input.viewedYear));
  if (view === 'chart') {
    if (options.selectedBranch !== undefined && options.selectedBranch !== null) {
      params.set('palace', String(options.selectedBranch));
    }
    if (options.activeDetailTab && options.activeDetailTab !== 'palace') {
      params.set('tab', options.activeDetailTab);
    }
  }
  const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  if (options.replace) window.history.replaceState({}, '', url);
  else window.history.pushState({}, '', url);
}

function parseInitialPage(): RestoredPage {
  const fromUrl = readUrlPage();
  if (fromUrl) return fromUrl;
  return { view: 'calendar', input: loadLastChartInput() ?? DEFAULT_INPUT, chart: null, selectedBranch: null, activeDetailTab: 'palace', bacDeNumber: 1, showBacDeResult: false, calendarDate: todayIsoDate() };
}

export default function App() {
  const [initialPage] = useState<RestoredPage>(parseInitialPage);
  const [view, setView] = useState<AppPage>(initialPage.view);
  const [formRevision, setFormRevision] = useState(0);
  const [currentInput, setCurrentInput] = useState<BirthInput>(initialPage.input);
  const [chart, setChart] = useState<ChartCore | null>(initialPage.chart);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(initialPage.selectedBranch);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>(initialPage.activeDetailTab);
  const [bacDeNumber, setBacDeNumber] = useState(initialPage.bacDeNumber);
  const [showBacDeResult, setShowBacDeResult] = useState(initialPage.showBacDeResult);
  const [calendarDate, setCalendarDate] = useState(initialPage.calendarDate);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [filters, setFilters] = useState<StarVisibilityFilters>({
    main: true,
    secondary: true,
    transformation: true,
    annual: true,
  });

  const handleFormValuesChange = useCallback((input: BirthInput) => {
    setCurrentInput(input);
    writePageUrl('form', input, { replace: true });
  }, []);

  useEffect(() => {
    const restoreFromUrl = () => {
      const restored = readUrlPage();
      if (!restored) {
        setView('calendar');
        setChart(null);
        setCurrentInput(DEFAULT_INPUT);
        setSelectedBranch(null);
        setActiveDetailTab('palace');
        setFormRevision(revision => revision + 1);
        setBacDeNumber(1);
        setShowBacDeResult(false);
        setCalendarDate(todayIsoDate());
        return;
      }
      setView(restored.view);
      setCurrentInput(restored.input);
      setChart(restored.chart);
      setSelectedBranch(restored.selectedBranch);
      setActiveDetailTab(restored.activeDetailTab);
      setFormRevision(revision => revision + 1);
      setBacDeNumber(restored.bacDeNumber);
      setShowBacDeResult(restored.showBacDeResult);
      setCalendarDate(restored.calendarDate);
    };
    window.addEventListener('popstate', restoreFromUrl);
    return () => window.removeEventListener('popstate', restoreFromUrl);
  }, []);

  const handleHome = () => {
    const date = todayIsoDate();
    setView('calendar');
    setCurrentInput(DEFAULT_INPUT);
    setChart(null);
    setSelectedBranch(null);
    setActiveDetailTab('palace');
    setFormRevision(revision => revision + 1);
    setBacDeNumber(1);
    setShowBacDeResult(false);
    setCalendarDate(date);
    writePageUrl('calendar', DEFAULT_INPUT, { calendarDate: date });
  };

  const handleShowForm = () => {
    setView('form');
    writePageUrl('form', currentInput);
  };

  const handleShowBacDe = () => {
    setView('bacde');
    setShowBacDeResult(false);
    writePageUrl('bacde', currentInput, { bacDeNumber, showBacDeResult: false });
  };

  const handleShowCalendar = () => {
    setView('calendar');
    writePageUrl('calendar', currentInput, { calendarDate });
  };

  const handleShowTangThu = () => {
    setView('tangthu');
    writePageUrl('tangthu', currentInput);
  };

  const handleCalendarDateChange = (date: string) => {
    if (!isValidCalendarDate(date)) return;
    setCalendarDate(date);
    writePageUrl('calendar', currentInput, { calendarDate: date, replace: true });
  };

  const handleBacDeNumberChange = (number: number) => {
    setBacDeNumber(number);
    setShowBacDeResult(false);
    if (Number.isInteger(number) && number >= 1 && number <= 51) {
      writePageUrl('bacde', currentInput, { bacDeNumber: number, replace: true });
    }
  };

  const handleReadBacDe = (number: number) => {
    if (!Number.isInteger(number) || number < 1 || number > 51) return;
    setBacDeNumber(number);
    setShowBacDeResult(true);
    writePageUrl('bacde', currentInput, { bacDeNumber: number, showBacDeResult: true });
  };

  const handleSelectPalace = (branch: number) => {
    setSelectedBranch(branch);
    writePageUrl('chart', currentInput, { selectedBranch: branch, activeDetailTab, replace: true });
  };

  const handleChangeDetailTab = (tab: DetailTab) => {
    setActiveDetailTab(tab);
    writePageUrl('chart', currentInput, { selectedBranch, activeDetailTab: tab, replace: true });
  };

  useEffect(() => {
    if (initialPage.view === 'chart' && !new URLSearchParams(window.location.search).has('page')) {
      writePageUrl('chart', initialPage.input, {
        selectedBranch: initialPage.selectedBranch,
        activeDetailTab: initialPage.activeDetailTab,
        replace: true,
      });
    }
    if (initialPage.view === 'bacde' && !new URLSearchParams(window.location.search).has('que')) {
      writePageUrl('bacde', initialPage.input, {
        bacDeNumber: initialPage.bacDeNumber,
        showBacDeResult: initialPage.showBacDeResult,
        replace: true,
      });
    }
    if (initialPage.view === 'calendar' && !new URLSearchParams(window.location.search).has('date')) {
      writePageUrl('calendar', initialPage.input, { calendarDate: initialPage.calendarDate, replace: true });
    }
  }, [initialPage]);

  // Xử lý tạo lá số
  const handleBuildChart = (input: BirthInput) => {
    try {
      const generatedChart = buildChart(input);
      setChart(generatedChart);
      setCurrentInput(input);
      try {
        // Persist only fields needed to recreate the chart; the person's name is not stored.
        const { gender, solarDate, hour, minute, unknownTime, viewedYear } = input;
        localStorage.setItem(LAST_CHART_INPUT_KEY, JSON.stringify({ gender, solarDate, hour, minute, unknownTime, viewedYear }));
      } catch {
        // The chart remains usable for this session when browser storage is unavailable.
      }
      // Mặc định chọn cung Mệnh nếu có, ngược lại chọn cung Dần (2)
      const initialBranch = generatedChart.menhBranch !== undefined ? generatedChart.menhBranch : 2;
      setSelectedBranch(initialBranch);
      setActiveDetailTab('palace');
      setView('chart');
      writePageUrl('chart', input, { selectedBranch: initialBranch });
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
    <div className="min-h-screen flex flex-col bg-[#fff7f7]">
      <Header
        onNewChart={handleShowForm}
        onHome={handleHome}
        showNewButton={view === 'chart'}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-2 md:px-6 py-4">
        {view !== 'chart' && <div role="tablist" aria-label="Trang chủ" className="mx-auto mb-5 grid max-w-6xl grid-cols-2 lg:grid-cols-4 gap-2 rounded-2xl border border-red-950/10 bg-white/75 p-2 shadow-sm">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'calendar'}
            onClick={handleShowCalendar}
            className={`flex min-h-[68px] items-center gap-2 rounded-xl px-2 py-3 text-left transition-all duration-200 sm:gap-3 sm:px-4 ${view === 'calendar' ? 'bg-gradient-to-r from-red-950 to-red-800 text-white shadow-md shadow-red-950/15' : 'text-stone-700 hover:bg-red-50'}`}
          >
            <CalendarDays className={`h-5 w-5 shrink-0 ${view === 'calendar' ? 'text-amber-200' : 'text-red-900'}`} />
            <span><span className="block font-serif text-xs font-bold sm:text-base">Lịch âm</span><span className={`mt-0.5 hidden text-[11px] sm:block sm:text-xs ${view === 'calendar' ? 'text-red-100' : 'text-stone-500'}`}>Tra cứu ngày và giờ</span></span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'form'}
            onClick={handleShowForm}
            className={`flex min-h-[68px] items-center gap-2 rounded-xl px-2 py-3 text-left transition-all duration-200 sm:gap-3 sm:px-4 ${view === 'form' ? 'bg-gradient-to-r from-red-950 to-red-800 text-white shadow-md shadow-red-950/15' : 'text-stone-700 hover:bg-red-50'}`}
          >
            <Compass className={`h-5 w-5 shrink-0 ${view === 'form' ? 'text-amber-200' : 'text-red-900'}`} />
            <span><span className="block font-serif text-xs font-bold sm:text-base">Lập lá số</span><span className={`mt-0.5 hidden text-[11px] sm:block sm:text-xs ${view === 'form' ? 'text-red-100' : 'text-stone-500'}`}>Nhập thông tin ngày giờ sinh</span></span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'bacde'}
            onClick={handleShowBacDe}
            className={`flex min-h-[68px] items-center gap-2 rounded-xl px-2 py-3 text-left transition-all duration-200 sm:gap-3 sm:px-4 ${view === 'bacde' ? 'bg-gradient-to-r from-red-950 to-red-800 text-white shadow-md shadow-red-950/15' : 'text-stone-700 hover:bg-red-50'}`}
          >
            <BookOpen className={`h-5 w-5 shrink-0 ${view === 'bacde' ? 'text-amber-200' : 'text-red-900'}`} />
            <span><span className="block font-serif text-xs font-bold sm:text-base">Quẻ Bắc Đế</span><span className={`mt-0.5 hidden text-[11px] sm:block sm:text-xs ${view === 'bacde' ? 'text-red-100' : 'text-stone-500'}`}>Tra cứu và gieo quẻ</span></span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'tangthu'}
            onClick={handleShowTangThu}
            className={`flex min-h-[68px] items-center gap-2 rounded-xl px-2 py-3 text-left transition-all duration-200 sm:gap-3 sm:px-4 ${view === 'tangthu' ? 'bg-gradient-to-r from-red-950 to-red-800 text-white shadow-md shadow-red-950/15' : 'text-stone-700 hover:bg-red-50'}`}
          >
            <BookMarked className={`h-5 w-5 shrink-0 ${view === 'tangthu' ? 'text-amber-200' : 'text-red-900'}`} />
            <span><span className="block font-serif text-xs font-bold sm:text-base">Tàng Thư</span><span className={`mt-0.5 hidden text-[11px] sm:block sm:text-xs ${view === 'tangthu' ? 'text-red-100' : 'text-stone-500'}`}>Cổ học tinh hoa & bài viết</span></span>
          </button>
        </div>}

        {view === 'form' && (
          <BirthForm
            key={`${view}-${formRevision}`}
            initialValues={currentInput}
            onSubmit={handleBuildChart}
            onValuesChange={handleFormValuesChange}
          />
        )}

        {view === 'bacde' && <BacDeTab
          number={bacDeNumber}
          showResult={showBacDeResult}
          onNumberChange={handleBacDeNumberChange}
          onRead={handleReadBacDe}
          onCast={handleReadBacDe}
        />}

        {view === 'calendar' && <LunarCalendarTab date={calendarDate} onDateChange={handleCalendarDateChange} />}

        {view === 'tangthu' && <TangThuTab />}

        {view === 'chart' && chart && (
          <div className="space-y-4 print-area">
            {/* Thanh công cụ: nút xuất PDF, in, zoom, lọc sao, lập lá số mới */}
            <ChartToolbar
              onBack={handleShowForm}
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
            <div className="w-full bg-[#fffafa] border border-[#f0dada] rounded-2xl shadow-sm p-2 md:p-4 overflow-hidden">
              <ChartGrid
                chart={chart}
                selectedBranch={selectedBranch}
                onSelectPalace={handleSelectPalace}
                filters={filters}
                zoom={zoom}
              />
            </div>

            {/* Panel chi tiết cung được chọn & Tam Phương Tứ Chính */}
            <PalaceDetailPanel
              chart={chart}
              selectedBranch={selectedBranch}
              activeTab={activeDetailTab}
              onChangeTab={handleChangeDetailTab}
              onSelectBranch={handleSelectPalace}
            />

          </div>
        )}
      </main>

      <footer className="no-print mt-10 w-full border-t border-amber-300/20 bg-gradient-to-br from-red-950 via-[#3b0b12] to-[#1d090d] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-8 md:grid-cols-[1.4fr_1fr] md:items-center md:py-11">
          <div>
            <div className="flex items-center gap-3">
              <BrandSeal />
              <div>
                <p className="font-serif text-lg font-bold tracking-wide text-amber-100">Tử Vi Cổ Học</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-200/75">Lịch pháp · Mệnh lý</p>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-red-100/80">Tra cứu lịch âm Việt Nam, tiết khí và lập lá số Tử Vi trong một giao diện thống nhất.</p>
          </div>

          <nav aria-label="Liên kết nhanh" className="md:justify-self-end">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-amber-200">Khám phá</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-red-100/85">
              <button type="button" onClick={() => { handleShowCalendar(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="transition hover:text-amber-200">Lịch âm</button>
              <button type="button" onClick={() => { handleShowForm(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="transition hover:text-amber-200">Lập lá số</button>
              <button type="button" onClick={() => { handleShowBacDe(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="transition hover:text-amber-200">Quẻ Bắc Đế</button>
              <button type="button" onClick={() => { handleShowTangThu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="transition hover:text-amber-200">Tàng Thư</button>
            </div>
          </nav>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 text-[11px] text-red-100/60 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span>© {new Date().getFullYear()} Tử Vi Cổ Học</span>
            <span>Lịch âm Việt Nam · Múi giờ UTC+7</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
