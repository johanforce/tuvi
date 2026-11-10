import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CalendarDays,
  Clock3,
  Database,
  Info,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { fetchXsmbHistory, type XsmbDraw, type XsmbHistoryResponse } from '../services/xsmb.js';
import { backtestFrequencyStrategy, calculateXsmbStats } from '../utils/xsmbStats.js';

type Panel = 'overview' | 'numbers' | 'loto' | 'de' | 'bachthu' | 'thanhlong';

const PERIODS = [7, 30, 60, 100];

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Chưa có';
  const parts = value.split('-').map(Number);
  if (parts.length !== 3) return value;
  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('vi-VN');
}

function percent(value: number): string {
  return value.toFixed(1).replace('.', ',') + '%';
}

function StatCard({ label, value, hint, icon: Icon }: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-amber-900/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-red-950">{value}</p>
          <p className="mt-1 text-xs text-stone-500">{hint}</p>
        </div>
        <span className="rounded-xl bg-amber-50 p-2 text-amber-800"><Icon className="h-5 w-5" /></span>
      </div>
    </div>
  );
}

function FrequencyBars({ rows, metric }: {
  rows: Array<{ number: string; value: number; subtitle: string }>;
  metric: string;
}) {
  const max = Math.max(1, ...rows.map(row => row.value));
  return (
    <div className="space-y-3">
      {rows.map(row => (
        <div key={row.number} className="grid grid-cols-[34px_minmax(0,1fr)_42px] items-center gap-3">
          <span className="font-mono text-sm font-bold text-red-950">{row.number}</span>
          <div className="min-w-0">
            <div className="h-3 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-gradient-to-r from-red-950 to-amber-600" style={{ width: ((row.value / max) * 100) + '%' }} />
            </div>
            <p className="mt-1 text-[11px] text-stone-500">{row.subtitle}</p>
          </div>
          <span className="text-right text-sm font-semibold tabular-nums text-stone-700">{row.value}</span>
        </div>
      ))}
      <p className="pt-1 text-[11px] text-stone-400">{metric}</p>
    </div>
  );
}

export const ThanSoHocTab: React.FC = () => {
  const [history, setHistory] = useState<XsmbHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(100);
  const [panel, setPanel] = useState<Panel>('overview');
  const [numberInput, setNumberInput] = useState('34');
  const [searchNumber, setSearchNumber] = useState('');

  const loadHistory = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchXsmbHistory(100, refresh);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu XSMB.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const draws = useMemo(() => {
    const all = history?.draws ?? [];
    return all.slice(-period);
  }, [history, period]);

  const stats = useMemo(() => calculateXsmbStats(draws), [draws]);
  const selectedNumber = /^\d{2}$/.test(numberInput) ? stats.numbers.find(item => item.number === numberInput) : undefined;
  const selectedDates = useMemo(() => {
    if (!selectedNumber) return [];
    return draws.filter(draw => draw.loto.includes(selectedNumber.number)).map(draw => draw.date).reverse();
  }, [draws, selectedNumber]);

  const filteredNumbers = useMemo(() => {
    const query = searchNumber.trim();
    return stats.numbers.filter(item => !query || item.number.includes(query));
  }, [stats.numbers, searchNumber]);

  const deBacktests = useMemo(
    () => [7, 14, 30, 60].map(windowSize => backtestFrequencyStrategy(history?.draws ?? [], windowSize, 'de')),
    [history],
  );
  const lotoBacktests = useMemo(
    () => [7, 14, 30, 60].map(windowSize => backtestFrequencyStrategy(history?.draws ?? [], windowSize, 'loto')),
    [history],
  );

  const tabs: Array<{ id: Panel; label: string }> = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'numbers', label: 'Bảng 00–99' },
    { id: 'loto', label: 'Thống kê lô' },
    { id: 'de', label: 'Thống kê đề' },
    { id: 'bachthu', label: 'Bạch thủ' },
    { id: 'thanhlong', label: 'Thanh Long' },
  ];

  if (loading) {
    return <div className="rounded-3xl border border-amber-900/10 bg-white p-12 text-center text-stone-600"><RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-red-900" />Đang tải kết quả XSMB thực tế...</div>;
  }

  if (!history) {
    return (
      <div className="rounded-3xl border border-red-200 bg-white p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-800" />
        <h2 className="font-serif text-xl font-bold text-red-950">Chưa tải được dữ liệu XSMB</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-stone-600">{error ?? 'Nguồn dữ liệu tạm thời không phản hồi.'}</p>
        <button type="button" onClick={() => void loadHistory(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-950 px-4 py-2.5 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" />Thử tải lại</button>
      </div>
    );
  }

  const topLoto = stats.topLoto.slice(0, 10).map(item => ({
    number: item.number,
    value: item.lotoOccurrences,
    subtitle: item.lotoHitDays + '/' + stats.drawCount + ' kỳ có mặt',
  }));
  const topDe = stats.topDe.filter(item => item.deOccurrences > 0).slice(0, 10).map(item => ({
    number: item.number,
    value: item.deOccurrences,
    subtitle: percent(item.deRate) + ' số kỳ',
  }));
  const latestDraw: XsmbDraw | undefined = draws[draws.length - 1];
  const sourceLabel = history.source === 'live' ? 'Nguồn trực tiếp' : 'Bản dữ liệu dự phòng';
  const sourceClass = history.source === 'live' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900';

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#26080c] via-[#4a1119] to-[#781e28] p-5 text-white shadow-lg md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">Tử Vi Cổ Học · Phân hệ dữ liệu</p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-amber-50 md:text-4xl">Thần số học</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-red-100/85">Phân tích kết quả XSMB từ dữ liệu quay thưởng đã công bố. Mọi bảng và biểu đồ bên dưới được tính trực tiếp từ các kỳ quay thực tế, không dùng dữ liệu minh họa.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ' + sourceClass}><Database className="h-3.5 w-3.5" />{sourceLabel}</span>
            <button type="button" disabled={refreshing} onClick={() => void loadHistory(true)} className="inline-flex items-center gap-2 rounded-xl border border-amber-200/30 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"><RefreshCw className={'h-4 w-4 ' + (refreshing ? 'animate-spin' : '')} />Làm mới dữ liệu</button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-red-100/75">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(history.startDate)} – {formatDate(history.endDate)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />Kiểm tra nguồn: {formatDate(history.checkedAt.slice(0, 10))}</span>
          <span className="inline-flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" />{history.drawCount} kỳ trong bộ dữ liệu</span>
        </div>
      </section>

      {error && <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error} Đang giữ dữ liệu đã tải gần nhất.</div>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Khoảng thống kê</p>
          <div className="mt-2 inline-flex rounded-xl border border-amber-900/10 bg-white p-1 shadow-sm">
            {PERIODS.map(days => <button key={days} type="button" onClick={() => setPeriod(days)} className={'rounded-lg px-3 py-2 text-sm font-semibold transition ' + (period === days ? 'bg-red-950 text-white' : 'text-stone-600 hover:bg-red-50')}>{days} ngày</button>)}
          </div>
        </div>
        <p className="text-xs text-stone-500">Đang phân tích {draws.length} kỳ · {stats.totalLotoOccurrences.toLocaleString('vi-VN')} lượt số lô</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Kỳ quay" value={String(stats.drawCount)} hint={formatDate(draws[0]?.date) + ' đến ' + formatDate(latestDraw?.date)} icon={CalendarDays} />
        <StatCard label="Tổng lượt lô" value={stats.totalLotoOccurrences.toLocaleString('vi-VN')} hint="27 kết quả hai chữ số mỗi kỳ" icon={BarChart3} />
        <StatCard label="Số có xuất hiện" value={String(stats.numbers.filter(item => item.lotoOccurrences > 0).length) + '/100'} hint="Tập số 00–99 trong kỳ thống kê" icon={Sparkles} />
        <StatCard label="Trung bình lượt lô/kỳ" value={stats.averageLotoOccurrencesPerDraw.toFixed(1).replace('.', ',')} hint="Số lần ghi nhận, không phải xác suất trúng" icon={TrendingUp} />
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-amber-900/10 bg-white p-2 shadow-sm">
        {tabs.map(tab => <button key={tab.id} type="button" onClick={() => setPanel(tab.id)} className={'shrink-0 rounded-xl px-3 py-2.5 text-sm font-semibold transition ' + (panel === tab.id ? 'bg-red-950 text-white' : 'text-stone-600 hover:bg-red-50')}>{tab.label}</button>)}
      </div>

      {panel === 'overview' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2"><h2 className="font-serif text-lg font-bold text-red-950">10 số lô xuất hiện nhiều nhất</h2><span className="text-xs text-stone-500">Đếm 27 đuôi giải/kỳ</span></div>
            <FrequencyBars rows={topLoto} metric="Số bên phải là tổng lượt xuất hiện. Dòng phụ là số kỳ có mặt." />
          </section>
          <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2"><h2 className="font-serif text-lg font-bold text-red-950">10 số đề xuất hiện nhiều nhất</h2><span className="text-xs text-stone-500">Đuôi giải đặc biệt</span></div>
            <FrequencyBars rows={topDe} metric="Tỷ lệ đề = số kỳ về đúng hai chữ số / tổng số kỳ." />
          </section>
          <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-serif text-lg font-bold text-red-950">Kết quả kỳ gần nhất</h2><span className="text-xs text-stone-500">{formatDate(latestDraw?.date)}</span></div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Đặc biệt</span>
              <span className="rounded-xl bg-red-950 px-4 py-2 font-mono text-xl font-bold tracking-wider text-amber-200">{latestDraw?.special}</span>
              <span className="ml-3 text-xs font-semibold uppercase tracking-wide text-stone-500">27 đuôi lô</span>
              {latestDraw?.loto.map((number, index) => <span key={index} className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 font-mono text-sm font-semibold text-stone-800">{number}</span>)}
            </div>
          </section>
        </div>
      )}

      {panel === 'numbers' && (
        <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><h2 className="font-serif text-lg font-bold text-red-950">Bảng tần suất 00–99</h2><p className="mt-1 text-xs text-stone-500">Tỷ lệ lô tính theo số kỳ có mặt, mỗi kỳ chỉ tính một lần.</p></div>
            <label className="relative block sm:w-56"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input value={searchNumber} onChange={event => setSearchNumber(event.target.value.replace(/[^0-9]/g, '').slice(0, 2))} placeholder="Tìm số 00–99" inputMode="numeric" className="w-full rounded-xl border border-stone-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-red-800" /></label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead><tr className="border-b border-stone-200 text-left text-xs text-stone-500"><th className="py-3 pr-3">Số</th><th className="py-3 pr-3 text-right">Lượt lô</th><th className="py-3 pr-3 text-right">Số kỳ có mặt</th><th className="py-3 pr-3 text-right">Tỷ lệ lô</th><th className="py-3 pr-3 text-right">Lượt đề</th><th className="py-3 pr-3 text-right">Tỷ lệ đề</th><th className="py-3 text-right">Lần cuối về lô</th></tr></thead>
              <tbody>{filteredNumbers.map(item => <tr key={item.number} className="border-b border-stone-100 last:border-0 hover:bg-red-50/50"><td className="py-2.5 pr-3 font-mono font-bold text-red-950">{item.number}</td><td className="py-2.5 pr-3 text-right tabular-nums">{item.lotoOccurrences}</td><td className="py-2.5 pr-3 text-right tabular-nums">{item.lotoHitDays}</td><td className="py-2.5 pr-3 text-right tabular-nums">{percent(item.lotoRate)}</td><td className="py-2.5 pr-3 text-right tabular-nums">{item.deOccurrences}</td><td className="py-2.5 pr-3 text-right tabular-nums">{percent(item.deRate)}</td><td className="py-2.5 text-right text-xs text-stone-500">{formatDate(item.lastLotoDate)}</td></tr>)}</tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-stone-500">Đang hiển thị {filteredNumbers.length} số. Tần suất 100 kỳ chỉ mô tả quá khứ, không khẳng định kỳ tới.</p>
        </section>
      )}

      {panel === 'loto' && (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-red-950">Bảng xếp hạng tần suất lô</h2>
            <p className="mb-4 mt-1 text-xs text-stone-500">Lượt xuất hiện có tính cả trường hợp một số về nhiều lần trong cùng một kỳ.</p>
            <FrequencyBars rows={stats.topLoto.slice(0, 20).map(item => ({ number: item.number, value: item.lotoOccurrences, subtitle: item.lotoHitDays + ' kỳ · ' + percent(item.lotoRate) }))} metric="Đếm từ toàn bộ 27 cặp số cuối của mỗi kỳ." />
          </section>
          <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-red-950">Độ phủ của lô</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">Một số có thể xuất hiện nhiều lần trong một ngày. Vì vậy hệ thống lưu riêng tổng lượt lô và số kỳ có mặt để tránh nhầm tần suất với tỷ lệ trúng.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-stone-50 p-3"><p className="text-xs text-stone-500">Tổng lượt</p><p className="mt-1 text-2xl font-bold text-red-950">{stats.totalLotoOccurrences}</p></div>
              <div className="rounded-xl bg-stone-50 p-3"><p className="text-xs text-stone-500">Số kỳ</p><p className="mt-1 text-2xl font-bold text-red-950">{stats.drawCount}</p></div>
            </div>
            <p className="mt-4 text-xs text-stone-500">Một số cụ thể được tính là có mặt nếu xuất hiện ít nhất một lần trong 27 kết quả của kỳ đó.</p>
          </section>
        </div>
      )}

      {panel === 'de' && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-red-950">Tần suất đuôi giải đặc biệt</h2>
            <p className="mb-4 mt-1 text-xs text-stone-500">Mỗi kỳ chỉ có một đuôi đề, nên tỷ lệ bằng số lần xuất hiện chia cho số kỳ.</p>
            <FrequencyBars rows={topDe.map(item => ({ number: item.number, value: item.value, subtitle: item.subtitle }))} metric="Đây là thống kê số đã về, không phải xác suất dự báo." />
          </section>
          <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-red-950">Backtest chọn đề theo tần suất quá khứ</h2>
            <p className="mt-1 text-xs leading-5 text-stone-500">Mỗi ngày chọn số xuất hiện nhiều nhất trong N kỳ ngay trước đó, rồi đối chiếu đuôi giải đặc biệt của kỳ kế tiếp. Quy tắc chọn được cố định trước mỗi lượt kiểm tra.</p>
            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[450px] text-sm"><thead><tr className="border-b text-xs text-stone-500"><th className="py-2 text-left">Cửa sổ</th><th className="py-2 text-right">Lượt kiểm tra</th><th className="py-2 text-right">Trúng</th><th className="py-2 text-right">Tỷ lệ trúng</th></tr></thead><tbody>{deBacktests.map(row => <tr key={row.windowSize} className="border-b border-stone-100"><td className="py-2.5">{row.windowSize} kỳ trước</td><td className="py-2.5 text-right tabular-nums">{row.bets}</td><td className="py-2.5 text-right tabular-nums">{row.hits}</td><td className="py-2.5 text-right font-semibold tabular-nums">{row.hitRate === null ? '—' : percent(row.hitRate)}</td></tr>)}</tbody></table></div>
          </section>
        </div>
      )}

      {panel === 'bachthu' && (
        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-red-950">Tra cứu bạch thủ lô</h2>
            <p className="mt-1 text-sm text-stone-500">Nhập một số từ 00 đến 99 để xem lịch sử xuất hiện trong khoảng đang chọn.</p>
            <div className="mt-5 flex gap-2"><input value={numberInput} onChange={event => setNumberInput(event.target.value.replace(/[^0-9]/g, '').slice(0, 2))} inputMode="numeric" maxLength={2} placeholder="00" className="w-28 rounded-xl border border-stone-200 px-4 py-3 text-center font-mono text-2xl font-bold tracking-wider text-red-950 outline-none focus:border-red-800" /><span className="self-center text-xs text-stone-500">Hai chữ số, ví dụ 04 hoặc 34</span></div>
            {selectedNumber ? <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-red-50 p-4"><p className="text-xs text-stone-500">Lượt lô</p><p className="mt-1 text-3xl font-bold text-red-950">{selectedNumber.lotoOccurrences}</p></div><div className="rounded-xl bg-amber-50 p-4"><p className="text-xs text-stone-500">Kỳ có mặt</p><p className="mt-1 text-3xl font-bold text-red-950">{selectedNumber.lotoHitDays}/{stats.drawCount}</p></div><div className="col-span-2 rounded-xl bg-stone-50 p-4"><p className="text-xs text-stone-500">Tỷ lệ kỳ có mặt trong lịch sử</p><p className="mt-1 text-3xl font-bold text-red-950">{percent(selectedNumber.lotoRate)}</p></div></div> : <p className="mt-4 text-sm text-red-700">Nhập đủ hai chữ số để tra cứu.</p>}
          </section>
          <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-red-950">Các kỳ đã xuất hiện</h2>
            {selectedNumber ? <><p className="mt-1 text-xs text-stone-500">Số {selectedNumber.number} có mặt trong {selectedDates.length} kỳ của khoảng dữ liệu đang chọn.</p><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{selectedDates.map(date => <div key={date} className="rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700">{formatDate(date)}</div>)}</div>{selectedDates.length===0 && <p className="mt-4 text-sm text-stone-500">Số này chưa xuất hiện trong khoảng đã chọn.</p>}</> : <p className="mt-3 text-sm text-stone-500">Chưa có số hợp lệ.</p>}
          </section>
          <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm xl:col-span-2">
            <h2 className="font-serif text-lg font-bold text-red-950">Backtest bạch thủ theo tần suất lô</h2>
            <p className="mt-1 text-xs leading-5 text-stone-500">Mỗi ngày chọn một số có tổng lượt lô cao nhất trong N kỳ trước, sau đó kiểm tra số đó có xuất hiện trong 27 kết quả của ngày kế tiếp hay không.</p>
            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[450px] text-sm"><thead><tr className="border-b text-xs text-stone-500"><th className="py-2 text-left">Cửa sổ</th><th className="py-2 text-right">Lượt kiểm tra</th><th className="py-2 text-right">Trúng</th><th className="py-2 text-right">Tỷ lệ trúng</th></tr></thead><tbody>{lotoBacktests.map(row => <tr key={row.windowSize} className="border-b border-stone-100"><td className="py-2.5">{row.windowSize} kỳ trước</td><td className="py-2.5 text-right tabular-nums">{row.bets}</td><td className="py-2.5 text-right tabular-nums">{row.hits}</td><td className="py-2.5 text-right font-semibold tabular-nums">{row.hitRate === null ? '—' : percent(row.hitRate)}</td></tr>)}</tbody></table></div>
          </section>
        </div>
      )}

      {panel === 'thanhlong' && (
        <section className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h2 className="font-serif text-lg font-bold text-red-950">Phương pháp Thanh Long</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Phần này chưa tự sinh số hoặc tỷ lệ. Cần chốt đúng quy tắc Thanh Long mà bạn sử dụng: cách lấy số, số lượng số trong một kỳ và điều kiện được tính là trúng. Sau khi có công thức, hệ thống sẽ chạy lại trên chính 100 kỳ dữ liệu đã lưu và hiển thị backtest có thể kiểm chứng.</p></div></div>
        </section>
      )}

      <section className="rounded-2xl border border-amber-900/20 bg-amber-50/70 p-4">
        <div className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" /><p className="text-xs leading-5 text-amber-950">Tần suất lịch sử và kết quả backtest không làm tăng xác suất của kỳ quay tiếp theo. Backtest chỉ đo hiệu quả của đúng quy tắc chọn số đã nêu trên các kỳ quá khứ, không phải cam kết kết quả tương lai.</p></div>
        <p className="mt-2 text-[11px] text-amber-900/75">Nguồn dữ liệu: <a className="underline" href={history.sourceUrl} target="_blank" rel="noreferrer">{history.sourceName}</a> · Giấy phép MIT; thông tin ghi công nằm trong data/xsmb/NOTICE.md.</p>
      </section>
    </div>
  );
};
