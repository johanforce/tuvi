import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Compass, Sun, Sunrise } from 'lucide-react';
import { solarDayCanChi, monthCanChi as calculateMonthCanChi, yearCanChi as calculateYearCanChi } from '../calendar/can-chi.js';
import { solarToLunar, solarTermsForYear, type SolarTermMoment } from '../calendar/vietnamese-lunar.js';
import { BRANCH_NAMES, mod } from '../engine/constants.js';
import { getNapAm } from '../data/napAm.js';

interface LunarCalendarTabProps {
  date: string;
  onDateChange: (date: string) => void;
}

const DAY_GODS = ['Thanh Long', 'Minh Đường', 'Thiên Hình', 'Chu Tước', 'Kim Quỹ', 'Bảo Quang', 'Bạch Hổ', 'Ngọc Đường', 'Thiên Lao', 'Huyền Vũ', 'Tư Mệnh', 'Câu Trần'];
const GOOD_DAY_GODS = new Set([0, 1, 4, 5, 7, 10]);
const HOANG_DAO_START_BY_MONTH_BRANCH = [8, 10, 0, 2, 4, 6, 8, 10, 0, 2, 4, 6];
const HOUR_HOANG_DAO: number[][] = [
  [0, 1, 3, 6, 8, 9], [2, 3, 5, 8, 10, 11], [0, 1, 4, 5, 7, 10], [0, 2, 3, 6, 7, 9],
  [2, 4, 5, 8, 9, 11], [1, 4, 6, 7, 10, 11], [0, 1, 3, 6, 8, 9], [2, 3, 5, 8, 10, 11],
  [0, 1, 4, 5, 7, 10], [0, 2, 3, 6, 7, 9], [2, 4, 5, 8, 9, 11], [1, 4, 6, 7, 10, 11],
];
const BRANCH_HOURS = ['23:00–01:00', '01:00–03:00', '03:00–05:00', '05:00–07:00', '07:00–09:00', '09:00–11:00', '11:00–13:00', '13:00–15:00', '15:00–17:00', '17:00–19:00', '19:00–21:00', '21:00–23:00'];
const TRUC_NAMES = ['Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp', 'Phá', 'Nguy', 'Thành', 'Thu', 'Khai', 'Bế'];
const TRUC_GUIDANCE: { good: string[]; avoid: string[] }[] = [
  { good: ['Xuất hành', 'Nhậm chức', 'Cầu tài'], avoid: ['Động thổ', 'Đào móng'] },
  { good: ['Dọn dẹp', 'Chữa bệnh', 'Phá dỡ nhà cũ'], avoid: ['Cưới hỏi', 'Khai trương'] },
  { good: ['Cúng tế', 'Cầu phúc', 'Khai trương'], avoid: ['An táng', 'Uống thuốc'] },
  { good: ['Cầu tài', 'Ký kết', 'An táng'], avoid: ['Xuất hành', 'Khai trương'] },
  { good: ['Cưới hỏi', 'Nhậm chức', 'Ký kết', 'An táng'], avoid: ['Khai trương', 'Động thổ'] },
  { good: ['Cầu tài', 'Kinh doanh', 'Ký kết'], avoid: ['Xuất hành', 'Chuyển nhà'] },
  { good: ['Phá dỡ'], avoid: ['Cưới hỏi', 'Động thổ', 'Khai trương'] },
  { good: ['Dọn dẹp', 'Sửa chữa nhỏ'], avoid: ['Việc quan trọng'] },
  { good: ['Khai trương', 'Kinh doanh', 'Cưới hỏi', 'Nhậm chức'], avoid: ['Kiện tụng', 'Tranh chấp'] },
  { good: ['Thu hoạch', 'Thu tiền', 'Ký kết'], avoid: ['Khởi công', 'Xuất hành', 'An táng'] },
  { good: ['Khai trương', 'Xuất hành', 'Cưới hỏi', 'Nhậm chức'], avoid: ['An táng'] },
  { good: ['An táng', 'Kết thúc công việc'], avoid: ['Khai trương', 'Xuất hành', 'Cưới hỏi'] },
];
const LUNAR_MONTH_NAMES = ['', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Một', 'Chạp'];
const WEEKDAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const TAM_NUONG = new Set([3, 7, 13, 18, 22, 27]);
const NGUYET_KY = new Set([5, 14, 23]);
const DUONG_CONG_KY: Record<number, number[]> = { 1: [13], 2: [11], 3: [9], 4: [7], 5: [5], 6: [3], 7: [8, 29], 8: [27], 9: [25], 10: [23], 11: [21], 12: [19] };
const TAM_HOP_GROUPS = [[0, 4, 8], [1, 5, 9], [2, 6, 10], [3, 7, 11]];
const LUC_HOP: Record<number, number> = { 0: 1, 1: 0, 2: 11, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2 };

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || year < 1900 || year > 2100) return null;
  return { year, month, day, date };
}

function shiftDate(value: string, days: number) {
  const parsed = parseIsoDate(value);
  if (!parsed) return value;
  parsed.date.setUTCDate(parsed.date.getUTCDate() + days);
  return `${parsed.date.getUTCFullYear()}-${String(parsed.date.getUTCMonth() + 1).padStart(2, '0')}-${String(parsed.date.getUTCDate()).padStart(2, '0')}`;
}

function formatSolarDate(value: string) {
  const parsed = parseIsoDate(value);
  return parsed ? `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}/${parsed.year}` : value;
}

function getDayEvents(day: number, month: number, leap: boolean, solarMonth: number, solarDay: number): string[] {
  const events: string[] = [];
  if (day === 1) events.push('Mùng Một');
  if (day === 15) events.push('Ngày Rằm');
  if (!leap) {
    if (month === 1 && day === 1) events.push('Tết Nguyên Đán');
    if (month === 3 && day === 3) events.push('Tết Hàn Thực');
    if (month === 5 && day === 5) events.push('Tết Đoan Ngọ');
    if (month === 7 && day === 15) events.push('Vu Lan');
    if (month === 8 && day === 15) events.push('Tết Trung Thu');
    if (month === 3 && day === 10) events.push('Giỗ Tổ Hùng Vương');
    if (month === 12 && day === 23) events.push('Ông Công Ông Táo');
  }
  if (solarMonth === 1 && solarDay === 1) events.push('Tết Dương lịch');
  if (solarMonth === 4 && solarDay === 30) events.push('Ngày Giải phóng miền Nam');
  if (solarMonth === 5 && solarDay === 1) events.push('Quốc tế Lao động');
  if (solarMonth === 9 && solarDay === 2) events.push('Quốc khánh');
  return events;
}

function getVietnameseCulturalDayLabels(lunarDay: number, lunarMonth: number, leap: boolean, solarMonth: number, solarDay: number): string[] {
  const labels: string[] = [];
  if (!leap && lunarMonth === 1 && lunarDay >= 1 && lunarDay <= 5) labels.push(`Tết Nguyên Đán · Mùng ${lunarDay}`);
  if (!leap && lunarMonth === 3 && lunarDay === 10) labels.push('Giỗ Tổ Hùng Vương');
  if (solarMonth === 11 && solarDay === 24) labels.push('Ngày Văn hóa Việt Nam');
  if (solarMonth === 9 && solarDay === 1) labels.push('Nghỉ lễ Quốc khánh');
  if (solarMonth === 9 && solarDay === 2) labels.push('Quốc khánh');
  if (solarMonth === 4 && solarDay === 30) labels.push('Ngày Giải phóng miền Nam');
  if (solarMonth === 5 && solarDay === 1) labels.push('Quốc tế Lao động');
  if (solarMonth === 1 && solarDay === 1) labels.push('Tết Dương lịch');
  return labels;
}

function solarTermTime(term: SolarTermMoment) {
  const date = new Date(term.localDateTime);
  return date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'medium', timeStyle: 'short' });
}

const SOLAR_TERM_CACHE = new Map<number, SolarTermMoment[]>();
function getCachedSolarTerms(year: number) {
  const cached = SOLAR_TERM_CACHE.get(year);
  if (cached) return cached;
  const calculated = solarTermsForYear(year);
  SOLAR_TERM_CACHE.set(year, calculated);
  return calculated;
}

export const LunarCalendarTab: React.FC<LunarCalendarTabProps> = ({ date, onDateChange }) => {
  const parsed = parseIsoDate(date);
  const [displayedMonth, setDisplayedMonth] = useState(() => parsed ? { year: parsed.year, month: parsed.month } : { year: 2026, month: 1 });
  const [birthYear, setBirthYear] = useState('');
  const [purpose, setPurpose] = useState('');
  useEffect(() => {
    if (parsed) setDisplayedMonth({ year: parsed.year, month: parsed.month });
  }, [date]);
  const info = useMemo(() => {
    if (!parsed) return null;
    const lunar = solarToLunar(parsed.day, parsed.month, parsed.year, 7);
    let lunarMonthLength = lunar.day;
    const lunarMonthKey = `${lunar.year}-${lunar.month}-${lunar.isLeapMonth}`;
    const lunarMonthCursor = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
    for (let offset = 0; offset < 30; offset++) {
      lunarMonthCursor.setUTCDate(lunarMonthCursor.getUTCDate() + 1);
      const nextLunar = solarToLunar(lunarMonthCursor.getUTCDate(), lunarMonthCursor.getUTCMonth() + 1, lunarMonthCursor.getUTCFullYear(), 7);
      if (`${nextLunar.year}-${nextLunar.month}-${nextLunar.isLeapMonth}` !== lunarMonthKey) break;
      lunarMonthLength = nextLunar.day;
    }
    const yearCanChi = calculateYearCanChi(lunar.year);
    const monthCanChi = calculateMonthCanChi(yearCanChi.stem, lunar.month);
    const dayCanChi = solarDayCanChi(parsed.day, parsed.month, parsed.year);
    const weekday = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)).getUTCDay();
    const terms = [
      ...getCachedSolarTerms(parsed.year - 1),
      ...getCachedSolarTerms(parsed.year),
      ...getCachedSolarTerms(parsed.year + 1),
    ].sort((a, b) => a.localDateTime.localeCompare(b.localDateTime));
    const previousTermIndex = terms.reduce((latest, term, index) => term.localDate <= date ? index : latest, -1);
    const currentTerm = previousTermIndex >= 0 ? terms[previousTermIndex]! : null;
    const nextTerm = terms[previousTermIndex + 1] ?? null;
    const monthStartTerm = [...terms.slice(0, previousTermIndex + 1)].reverse().find(term => term.index % 2 === 0) ?? null;
    const seasonalMonthBranch = monthStartTerm ? mod(2 + monthStartTerm.index / 2) : 2;
    const dayGodStart = HOANG_DAO_START_BY_MONTH_BRANCH[mod(lunar.month + 1)]!;
    const dayGodIndex = mod(dayCanChi.branch - dayGodStart);
    const dayGod = DAY_GODS[dayGodIndex]!;
    const isHoangDao = GOOD_DAY_GODS.has(dayGodIndex);
    const trucIndex = mod(dayCanChi.branch - seasonalMonthBranch);
    const goodHours = HOUR_HOANG_DAO[dayCanChi.branch]!;
    const tamHop = TAM_HOP_GROUPS.find(group => group.includes(dayCanChi.branch))!.filter(branch => branch !== dayCanChi.branch);
    const events = getDayEvents(lunar.day, lunar.month, lunar.isLeapMonth, parsed.month, parsed.day);
    const specialDays = [
      ...(TAM_NUONG.has(lunar.day) ? ['Tam Nương'] : []),
      ...(NGUYET_KY.has(lunar.day) ? ['Nguyệt Kỵ'] : []),
      ...(DUONG_CONG_KY[lunar.month]?.includes(lunar.day) ? ['Dương Công kỵ nhật'] : []),
    ];
    const activities = TRUC_GUIDANCE[trucIndex]!;
    const monthName = `${lunar.isLeapMonth ? 'Nhuận ' : ''}tháng ${LUNAR_MONTH_NAMES[lunar.month] ?? lunar.month}`;
    const calendarTerms = terms.filter(term => term.localDate.slice(0, 4) === String(parsed.year));

    return {
      lunar, lunarMonthLength, yearCanChi, monthCanChi, dayCanChi, weekday,
      currentTerm, nextTerm, monthStartTerm, seasonalMonthBranch, dayGod, isHoangDao,
      goodHours, specialDays, events, activities, monthName, calendarTerms,
      dayNapAm: getNapAm(dayCanChi.label),
      monthNapAm: getNapAm(monthCanChi.label),
      yearNapAm: getNapAm(yearCanChi.label),
      tamHop, lucHop: LUC_HOP[dayCanChi.branch]!, xung: mod(dayCanChi.branch + 6),
    };
  }, [date, parsed?.day, parsed?.month, parsed?.year]);

  if (!parsed || !info) return <p role="alert" className="mx-auto max-w-4xl rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">Ngày cần nằm trong khoảng năm 1900–2100 và đúng định dạng.</p>;

  const allHours = Array.from({ length: 12 }, (_, index) => index);
  const badges = 'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold';
  const monthStart = new Date(Date.UTC(displayedMonth.year, displayedMonth.month - 1, 1));
  const mondayOffset = (monthStart.getUTCDay() + 6) % 7;
  const calendarStart = new Date(Date.UTC(displayedMonth.year, displayedMonth.month - 1, 1 - mondayOffset));
  const monthDays = Array.from({ length: 42 }, (_, index) => {
    const cellDate = new Date(calendarStart);
    cellDate.setUTCDate(calendarStart.getUTCDate() + index);
    const iso = `${cellDate.getUTCFullYear()}-${String(cellDate.getUTCMonth() + 1).padStart(2, '0')}-${String(cellDate.getUTCDate()).padStart(2, '0')}`;
    const lunarDate = solarToLunar(cellDate.getUTCDate(), cellDate.getUTCMonth() + 1, cellDate.getUTCFullYear(), 7);
    const dayCanChi = solarDayCanChi(cellDate.getUTCDate(), cellDate.getUTCMonth() + 1, cellDate.getUTCFullYear());
    const dayGodStart = HOANG_DAO_START_BY_MONTH_BRANCH[mod(lunarDate.month + 1)]!;
    const dayGod = DAY_GODS[mod(dayCanChi.branch - dayGodStart)]!;
    const isHoangDao = GOOD_DAY_GODS.has(DAY_GODS.indexOf(dayGod));
    const markerColor = isHoangDao ? (dayGod === 'Thanh Long' ? 'bg-red-600' : 'bg-amber-400') : 'bg-black';
    const culturalLabels = getVietnameseCulturalDayLabels(lunarDate.day, lunarDate.month, lunarDate.isLeapMonth, cellDate.getUTCMonth() + 1, cellDate.getUTCDate());
    const culturalDate = culturalLabels.length > 0;
    const solarTerms = cellDate.getUTCFullYear() >= 1900 && cellDate.getUTCFullYear() <= 2100
      ? getCachedSolarTerms(cellDate.getUTCFullYear()).filter(term => term.localDate === iso).map(term => term.name)
      : [];
    return { iso, day: cellDate.getUTCDate(), inMonth: cellDate.getUTCMonth() + 1 === displayedMonth.month, lunarDay: lunarDate.day, lunarMonth: lunarDate.month, leap: lunarDate.isLeapMonth, dayCanChi: dayCanChi.label, dayGod, markerColor, solarTerms, culturalDate, culturalLabels, inRange: cellDate.getUTCFullYear() >= 1900 && cellDate.getUTCFullYear() <= 2100 };
  });
  const changeDisplayedMonth = (offset: number) => {
    const next = new Date(Date.UTC(displayedMonth.year, displayedMonth.month - 1 + offset, 1));
    if (next.getUTCFullYear() >= 1900 && next.getUTCFullYear() <= 2100) setDisplayedMonth({ year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 });
  };
  const purposeOptions = ['Cưới hỏi', 'Khai trương', 'Xuất hành', 'Nhập trạch', 'Cầu tài', 'Động thổ', 'Ký kết', 'An táng', 'Chữa bệnh', 'Nhậm chức'];
  const purposeStatus = purpose ? (info.activities.good.some(item => item.toLocaleLowerCase('vi').includes(purpose.toLocaleLowerCase('vi')))
    ? 'Nằm trong nhóm nên làm theo Trực ngày'
    : info.activities.avoid.some(item => item.toLocaleLowerCase('vi').includes(purpose.toLocaleLowerCase('vi')))
      ? 'Nằm trong nhóm nên tránh theo Trực ngày'
      : 'Trực ngày chưa có khuyến nghị riêng cho việc này') : '';
  const parsedBirthYear = Number(birthYear);
  const birthYearCanChi = Number.isInteger(parsedBirthYear) && parsedBirthYear >= 1900 && parsedBirthYear <= 2100 ? calculateYearCanChi(parsedBirthYear) : null;
  const ageBranchRelation = birthYearCanChi
    ? birthYearCanChi.branch === info.xung ? 'Tuổi năm sinh thuộc địa chi xung với ngày.'
      : info.tamHop.includes(birthYearCanChi.branch) || info.lucHop === birthYearCanChi.branch ? 'Tuổi năm sinh thuộc nhóm tam hợp/lục hợp với ngày.'
        : 'Không thuộc nhóm xung hoặc hợp đang xét.'
    : '';

  return <div className="mx-auto max-w-6xl space-y-5 px-4 py-7">
    <section className="paper-card-double overflow-hidden">
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 px-5 py-6 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Lịch âm Việt Nam · Múi giờ UTC+7</p>
        <h1 className="mt-1 font-serif text-3xl font-bold">Xem lịch âm</h1>
        <p className="mt-2 text-sm text-red-100">Tra ngày âm dương, Can Chi, giờ Hoàng đạo, tiết khí và ngày lễ.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3 p-5 sm:px-8">
        <button type="button" aria-label="Ngày trước" title="Ngày trước" onClick={() => onDateChange(shiftDate(date, -1))} className="btn btn-outline !px-3"><ChevronLeft className="h-4 w-4" /></button>
        <div className="w-full sm:max-w-xs">
          <label htmlFor="calendar-date" className="field-label">Chọn ngày dương lịch</label>
          <input id="calendar-date" type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={event => event.target.value && onDateChange(event.target.value)} className="field" />
        </div>
        <button type="button" aria-label="Ngày sau" title="Ngày sau" onClick={() => onDateChange(shiftDate(date, 1))} className="btn btn-outline !px-3"><ChevronRight className="h-4 w-4" /></button>
        <button type="button" onClick={() => {
          const today = new Date();
          onDateChange(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
        }} className="btn btn-outline">Hôm nay</button>
      </div>
    </section>

    <section className="paper-card p-4 sm:p-5" aria-label="Lịch tháng">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button type="button" aria-label="Tháng trước" onClick={() => changeDisplayedMonth(-1)} className="btn btn-outline !px-3"><ChevronLeft className="h-4 w-4" /></button>
        <div className="text-center">
          <h2 className="font-serif text-lg font-bold text-oriental-crimson">Tháng {displayedMonth.month}/{displayedMonth.year}</h2>
          <p className="mt-0.5 text-xs font-medium text-stone-700">Tháng {info.lunar.month === 12 ? 'Chạp' : String(info.lunar.month).padStart(2, '0')}{info.lunar.isLeapMonth ? ' nhuận' : ''}({info.lunarMonthLength === 30 ? 'Đủ' : 'Thiếu'}) {info.monthCanChi.label}, Năm {info.yearCanChi.label}</p>
        </div>
        <button type="button" aria-label="Tháng sau" onClick={() => changeDisplayedMonth(1)} className="btn btn-outline !px-3"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-stone-500">{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <div key={day} className={`py-2 ${day === 'T7' || day === 'CN' ? 'text-red-700' : ''}`}>{day}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map(cell => {
          const weekday = new Date(`${cell.iso}T00:00:00Z`).getUTCDay();
          const weekend = weekday === 0 || weekday === 6;
          return <button key={cell.iso} type="button" disabled={!cell.inRange} onClick={() => onDateChange(cell.iso)} aria-pressed={cell.iso === date} aria-label={`${cell.day}, âm lịch ngày ${cell.lunarDay}${cell.leap ? ' tháng nhuận' : ''}, ${cell.dayCanChi}, ${cell.dayGod}${cell.culturalLabels.length ? `, ${cell.culturalLabels.join(', ')}` : ''}${cell.solarTerms.length ? `, tiết khí ${cell.solarTerms.join(', ')}` : ''}`} title={`${cell.dayCanChi} · ${cell.dayGod}${cell.culturalLabels.length ? ` · ${cell.culturalLabels.join(', ')}` : ''}${cell.solarTerms.length ? ` · ${cell.solarTerms.join(', ')}` : ''}`} className={`relative min-h-[4.5rem] rounded-lg border p-1 text-center transition hover:border-red-400 disabled:cursor-not-allowed sm:min-h-[5rem] ${cell.iso === date ? `border-red-800 ${cell.culturalDate ? 'bg-pink-200' : 'bg-red-50'} ring-1 ring-red-800` : cell.culturalDate ? 'border-pink-200 bg-pink-100' : 'border-stone-100 bg-white'} ${cell.inMonth ? '' : 'opacity-40'}`}>
          <span className={`absolute left-1.5 top-1 text-lg font-bold leading-none ${weekend ? 'text-red-700' : 'text-stone-800'}`}>{cell.day}</span>
          <span className={`mt-4 block text-xs font-semibold leading-tight sm:text-sm ${cell.lunarDay === 1 ? 'text-red-800' : 'text-stone-700'}`}>{String(cell.lunarDay).padStart(2, '0')}/{String(cell.lunarMonth).padStart(2, '0')}{cell.leap ? '*' : ''}</span>
          <span className="block whitespace-nowrap text-[10px] font-medium leading-tight tracking-tight text-stone-600">{cell.dayCanChi}</span>
          {cell.culturalLabels.map(label => <span key={label} className="mt-0.5 block break-words text-[10px] font-semibold leading-tight text-pink-900">{label}</span>)}
          {cell.solarTerms.length > 0 && <span className="mt-1 block break-words text-[9px] font-semibold leading-tight text-amber-800">{cell.solarTerms.join(' · ')}</span>}
          <span aria-hidden="true" className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${cell.markerColor}`} />
        </button>;
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-600" aria-label="Chú giải ngày Hoàng Hắc đạo">
        <span className="inline-flex items-center gap-1.5"><i aria-hidden="true" className="h-2 w-2 rounded-full bg-black" />Hắc đạo</span>
        <span className="inline-flex items-center gap-1.5"><i aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-400" />Hoàng đạo</span>
        <span className="inline-flex items-center gap-1.5"><i aria-hidden="true" className="h-2 w-2 rounded-full bg-red-600" />Thanh Long Hoàng đạo</span>
        <span className="inline-flex items-center gap-1.5"><i aria-hidden="true" className="h-3 w-3 rounded-sm border border-pink-200 bg-pink-100" />Ngày nghỉ lễ trong năm</span>
        <span>Số nhỏ là ngày âm · Dòng dưới là Can Chi ngày</span>
      </div>
    </section>

    <section className="paper-card p-5 sm:p-7">
      <div className="mb-4 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-red-900" /><h2 className="font-serif text-xl font-bold text-oriental-crimson">Thông tin ngày {formatSolarDate(date)}</h2></div>
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ['Ngày dương lịch', `${formatSolarDate(date)} · ${info.monthName} âm · ${info.monthCanChi.label}`],
          ['Ngày âm lịch', `${String(info.lunar.day).padStart(2, '0')}/${String(info.lunar.month).padStart(2, '0')}/${info.lunar.year}${info.lunar.isLeapMonth ? ' (tháng nhuận)' : ''}`],
          ['Tháng âm lịch', info.monthName],
          ['Năm âm lịch', `${info.yearCanChi.label} (${info.lunar.year})`],
          ['Can Chi ngày', info.dayCanChi.label],
          ['Can Chi tháng', info.monthCanChi.label],
          ['Can Chi năm', info.yearCanChi.label],
          ['Ngày trong tuần', WEEKDAY_NAMES[info.weekday]],
          ['Tháng nhuận', info.lunar.isLeapMonth ? 'Có' : 'Không'],
        ].map(([label, value]) => <div key={label} className="border-b border-amber-900/10 pb-2"><dt className="text-xs font-medium text-stone-500">{label}</dt><dd className="mt-0.5 font-semibold text-stone-800">{value}</dd></div>)}
      </dl>
    </section>

    <div className="grid gap-5 lg:grid-cols-2">
      <section className="paper-card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2"><Sun className="h-5 w-5 text-amber-700" /><h2 className="font-serif text-xl font-bold text-oriental-crimson">Ngày tốt, ngày cần lưu ý</h2></div>
        <div className="flex flex-wrap gap-2">
          <span className={`${badges} ${info.isHoangDao ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>{info.isHoangDao ? 'Hoàng đạo' : 'Hắc đạo'} · {info.dayGod}</span>
          <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">Trực {TRUC_NAMES[mod(info.dayCanChi.branch - info.seasonalMonthBranch)]}</span>
          {info.specialDays.map(day => <span key={day} className="inline-flex rounded-full border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800">{day}</span>)}
          {info.specialDays.length === 0 && <span className="text-sm text-stone-500">Không rơi vào Tam Nương, Nguyệt Kỵ hoặc Dương Công kỵ nhật theo bảng đang dùng.</span>}
        </div>
        <div className="rounded-xl bg-[#fffaf4] p-4">
          <h3 className="text-sm font-bold text-stone-800">Tên sao Hoàng/Hắc đạo</h3>
          <p className="mt-1 text-sm text-stone-700">{info.dayGod} là {info.isHoangDao ? 'sao Hoàng đạo' : 'sao Hắc đạo'} trong vòng 12 thần.</p>
          <p className="mt-2 text-xs leading-5 text-stone-500">Sao tốt/xấu theo Ngọc Hạp và Nhị thập bát tú chưa có bộ dữ liệu trong ứng dụng. Tính ngày Hoàng/Hắc đạo theo tháng âm; 12 Trực theo tháng tiết khí.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-stone-600">Năm sinh dương lịch để đối chiếu địa chi
            <input type="number" min="1900" max="2100" value={birthYear} onChange={event => setBirthYear(event.target.value)} placeholder="Ví dụ: 1990" className="field mt-1" />
            {birthYearCanChi && <span className="mt-1 block text-stone-700">{birthYearCanChi.label} · {ageBranchRelation}</span>}
          </label>
          <label className="text-xs font-medium text-stone-600">Mục đích muốn xem
            <select value={purpose} onChange={event => setPurpose(event.target.value)} className="field mt-1"><option value="">Chọn một việc</option>{purposeOptions.map(option => <option key={option}>{option}</option>)}</select>
            {purposeStatus && <span className="mt-1 block text-stone-700">{purposeStatus}</span>}
          </label>
        </div>
        <p className="text-xs leading-5 text-stone-500">Đối chiếu tuổi chỉ xét địa chi theo năm sinh nhập vào với chi ngày; người sinh trước Tết âm lịch có thể thuộc Can Chi năm trước. Cách này chưa thay thế chọn tuổi theo ngày sinh và can chi đầy đủ. Gợi ý mục đích dựa trên 12 Trực, không phải kết luận tổng hợp từ sao tốt/xấu.</p>
      </section>

      <section className="paper-card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-amber-700" /><h2 className="font-serif text-xl font-bold text-oriental-crimson">Giờ trong ngày</h2></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {allHours.map(branch => {
            const good = info.goodHours.includes(branch);
            return <div key={branch} className={`rounded-xl border p-3 ${good ? 'border-emerald-200 bg-emerald-50/70' : 'border-stone-200 bg-stone-50/70'}`}>
              <p className="font-semibold text-stone-800">Giờ {BRANCH_NAMES[branch]}</p>
              <p className="mt-0.5 text-xs text-stone-600">{BRANCH_HOURS[branch]}</p>
              <p className={`mt-1 text-[11px] font-bold ${good ? 'text-emerald-800' : 'text-stone-500'}`}>{good ? 'Giờ Hoàng đạo' : 'Giờ Hắc đạo'}</p>
            </div>;
          })}
        </div>
        <p className="text-xs leading-5 text-stone-500">Giờ tốt xuất hành theo Lục Diệu/Khổng Minh chưa được tính. Có thể đối chiếu Can Chi giờ với tuổi để cân nhắc thêm.</p>
      </section>

      <section className="paper-card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2"><Compass className="h-5 w-5 text-red-900" /><h2 className="font-serif text-xl font-bold text-oriental-crimson">Nên làm và nên tránh</h2></div>
        <p className="text-xs text-stone-500">Gợi ý theo Trực {TRUC_NAMES[mod(info.dayCanChi.branch - info.seasonalMonthBranch)]} · tháng tiết khí {BRANCH_NAMES[info.seasonalMonthBranch]}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4"><h3 className="font-semibold text-emerald-900">Nên làm</h3><ul className="mt-2 list-inside list-disc space-y-1 text-sm text-stone-700">{info.activities.good.map(activity => <li key={activity}>{activity}</li>)}</ul></div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4"><h3 className="font-semibold text-rose-900">Nên tránh</h3><ul className="mt-2 list-inside list-disc space-y-1 text-sm text-stone-700">{info.activities.avoid.map(activity => <li key={activity}>{activity}</li>)}</ul></div>
        </div>
        <p className="text-xs leading-5 text-stone-500">Danh sách dựa trên ý nghĩa phổ biến của 12 Trực; các sách lịch có thể xếp việc nên/kiêng khác nhau.</p>
      </section>

      <section className="paper-card space-y-4 p-5 sm:p-6">
        <div className="flex items-center gap-2"><Compass className="h-5 w-5 text-red-900" /><h2 className="font-serif text-xl font-bold text-oriental-crimson">Phong thủy và xuất hành</h2></div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div><dt className="text-xs text-stone-500">Nạp âm ngày</dt><dd className="text-sm font-semibold">{info.dayNapAm}</dd></div>
          <div><dt className="text-xs text-stone-500">Nạp âm tháng</dt><dd className="text-sm font-semibold">{info.monthNapAm}</dd></div>
          <div><dt className="text-xs text-stone-500">Nạp âm năm</dt><dd className="text-sm font-semibold">{info.yearNapAm}</dd></div>
          <div><dt className="text-xs text-stone-500">Địa chi xung ngày</dt><dd className="text-sm font-semibold">{BRANCH_NAMES[info.xung]}</dd></div>
          <div><dt className="text-xs text-stone-500">Địa chi tam hợp</dt><dd className="text-sm font-semibold">{info.tamHop.map(branch => BRANCH_NAMES[branch]).join(', ')}</dd></div>
          <div><dt className="text-xs text-stone-500">Địa chi lục hợp</dt><dd className="text-sm font-semibold">{BRANCH_NAMES[info.lucHop]}</dd></div>
        </dl>
        <p className="text-xs leading-5 text-stone-500">Hướng xuất hành, Hỷ thần, Tài thần và tuổi hợp/xung theo năm sinh cụ thể cần bảng quy tắc riêng, hiện chưa được tích hợp.</p>
      </section>
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      <section className="paper-card space-y-3 p-5 sm:p-6">
        <h2 className="font-serif text-xl font-bold text-oriental-crimson">Ngày lễ và sự kiện văn hóa</h2>
        {info.events.length > 0 ? <ul className="flex flex-wrap gap-2">{info.events.map(event => <li key={event} className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-950">{event}</li>)}</ul> : <p className="text-sm text-stone-500">Không có ngày lễ/sự kiện văn hóa đã khai báo trùng ngày này.</p>}
        <p className="text-xs text-stone-500">Các lễ âm lịch được đánh dấu theo ngày âm phổ biến; ngày giỗ tổ và lễ hội địa phương có thể khác nhau theo vùng.</p>
      </section>

      <section className="paper-card space-y-3 p-5 sm:p-6">
        <div className="flex items-center gap-2"><Sunrise className="h-5 w-5 text-amber-700" /><h2 className="font-serif text-xl font-bold text-oriental-crimson">Tiết khí</h2></div>
        <p className="text-sm text-stone-700">Ngày này thuộc tiết <strong>{info.currentTerm?.name ?? 'Chưa xác định'}</strong>{info.currentTerm ? `, bắt đầu ${solarTermTime(info.currentTerm)}.` : '.'}</p>
        {info.nextTerm && <p className="text-sm text-stone-700">Tiết tiếp theo: <strong>{info.nextTerm.name}</strong>, bắt đầu {solarTermTime(info.nextTerm)}.</p>}
        <details className="rounded-xl border border-amber-900/10 bg-white/60 p-3">
          <summary className="cursor-pointer font-semibold text-oriental-crimson">Xem đủ 24 tiết khí trong năm {parsed.year}</summary>
          <ul className="mt-3 grid gap-2 border-t border-amber-900/10 pt-3 sm:grid-cols-2">{info.calendarTerms.map(term => <li key={term.name} className="text-sm"><span className="font-medium">{term.name}</span><span className="ml-2 text-xs text-stone-500">{solarTermTime(term)}</span></li>)}</ul>
        </details>
        <p className="text-xs leading-5 text-stone-500">Thời điểm được tính thiên văn theo kinh độ Mặt Trời, hiển thị giờ Việt Nam UTC+7. Quy ước tháng tiết khí chuyển sang tháng mới từ ngày có tiết.</p>
      </section>
    </div>

    <p className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-5 text-amber-950">Lịch âm và các nhãn ngày tốt/xấu thể hiện quy ước lịch pháp dân gian để tham khảo. Ngày Hoàng đạo không bảo đảm việc sẽ thuận lợi; các quyết định về sức khỏe, pháp lý, tài chính nên dựa trên tư vấn chuyên môn và điều kiện thực tế.</p>
  </div>;
};
