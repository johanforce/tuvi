import React, { useState } from 'react';
import type { BirthInput } from '../engine/types.js';
import { Calendar, Clock, User, Sparkles, CheckCircle2 } from 'lucide-react';

interface BirthFormProps {
  initialValues?: Partial<BirthInput>;
  onSubmit: (data: BirthInput) => void;
}

export const BirthForm: React.FC<BirthFormProps> = ({
  initialValues,
  onSubmit,
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [gender, setGender] = useState<'nam' | 'nu'>(initialValues?.gender || 'nam');
  const [solarDate, setSolarDate] = useState(initialValues?.solarDate || '1999-07-06');
  const [time, setTime] = useState(
    initialValues?.hour !== undefined && initialValues?.minute !== undefined
      ? `${String(initialValues.hour).padStart(2, '0')}:${String(initialValues.minute).padStart(2, '0')}`
      : '10:30'
  );
  const [unknownTime, setUnknownTime] = useState(initialValues?.unknownTime || false);
  const [viewedYear, setViewedYear] = useState<number>(initialValues?.viewedYear || 2026);
  const [errors, setErrors] = useState<{ date?: string; time?: string; gender?: string }>({});

  // Tính địa chi giờ sinh trợ giúp
  const getHourBranchName = (timeStr: string) => {
    if (!timeStr || unknownTime) return null;
    const [hStr] = timeStr.split(':');
    const h = parseInt(hStr, 10);
    if (isNaN(h)) return null;

    if (h === 23 || h === 0) return 'Giờ Tý (23:00–00:59)';
    if (h >= 1 && h <= 2) return 'Giờ Sửu (01:00–02:59)';
    if (h >= 3 && h <= 4) return 'Giờ Dần (03:00–04:59)';
    if (h >= 5 && h <= 6) return 'Giờ Mão (05:00–06:59)';
    if (h >= 7 && h <= 8) return 'Giờ Thìn (07:00–08:59)';
    if (h >= 9 && h <= 10) return 'Giờ Tỵ (09:00–10:59)';
    if (h >= 11 && h <= 12) return 'Giờ Ngọ (11:00–12:59)';
    if (h >= 13 && h <= 14) return 'Giờ Mùi (13:00–14:59)';
    if (h >= 15 && h <= 16) return 'Giờ Thân (15:00–16:59)';
    if (h >= 17 && h <= 18) return 'Giờ Dậu (17:00–18:59)';
    if (h >= 19 && h <= 20) return 'Giờ Tuất (19:00–20:59)';
    if (h >= 21 && h <= 22) return 'Giờ Hợi (21:00–22:59)';
    return null;
  };

  const hourHelper = getHourBranchName(time);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { date?: string; time?: string; gender?: string } = {};

    if (!solarDate) {
      newErrors.date = 'Vui lòng chọn ngày sinh dương lịch';
    } else {
      const year = parseInt(solarDate.split('-')[0], 10);
      if (year < 1900 || year > 2100) {
        newErrors.date = 'Hệ thống hỗ trợ năm sinh từ 1900 đến 2100';
      }
    }

    if (!unknownTime && !time) {
      newErrors.time = 'Vui lòng nhập giờ sinh hoặc chọn "Không rõ giờ sinh"';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let parsedHour: number | undefined = undefined;
    let parsedMinute: number | undefined = undefined;

    if (!unknownTime && time) {
      const [h, m] = time.split(':').map(Number);
      parsedHour = h;
      parsedMinute = m;
    }

    onSubmit({
      name: name.trim() || undefined,
      gender,
      solarDate,
      hour: parsedHour,
      minute: parsedMinute,
      unknownTime,
      viewedYear,
    });
  };

  // Nạp dữ liệu mẫu để thử nghiệm nhanh (Fixture TV-001 hoặc 1999)
  const handleLoadSample = (sampleType: 'tv001' | '1999') => {
    if (sampleType === 'tv001') {
      setName('Mẫu TV-001 (Canh Tuất)');
      setGender('nam');
      setSolarDate('1970-12-08');
      setTime('10:00');
      setUnknownTime(false);
      setViewedYear(2026);
    } else {
      setName('Nguyễn Văn Tuệ');
      setGender('nam');
      setSolarDate('1999-07-06');
      setTime('10:30');
      setUnknownTime(false);
      setViewedYear(2026);
    }
    setErrors({});
  };

  const handleReset = () => {
    setName('');
    setGender('nam');
    setSolarDate('1999-07-06');
    setTime('10:30');
    setUnknownTime(false);
    setViewedYear(2026);
    setErrors({});
  };

  const sampleBtn = 'btn btn-outline !px-3 !py-1.5 !text-[12px]';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        {/* Cột trái: Giới thiệu */}
        <div className="space-y-5 lg:col-span-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1 text-[12px] font-semibold text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
            <span>Thuật Toán Chuẩn Hóa Theo tuvidauso.ai.studio</span>
          </div>

          <div className="flex items-start gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-oriental-crimson dark:text-amber-400 md:text-4xl">
                Lập Lá Số
                <br />
                Tử Vi Đẩu Số
              </h1>
              <hr className="gold-rule mt-3 w-40" />
            </div>
            <div className="imperial-seal mt-1 shrink-0" aria-hidden="true">命</div>
          </div>

          <p className="text-[14px] leading-relaxed text-stone-600 dark:text-slate-300">
            Nhập ngày giờ sinh dương lịch để lập lá số theo địa bàn 4x4 truyền thống. Toàn bộ 14 chính tinh, phụ tinh, vòng Tràng Sinh, Bác Sĩ, Thái Tuế và các lớp sao Lưu Niên v0.2.4 được hiển thị trực quan.
          </p>

          <div className="paper-inset space-y-2 p-4 text-[13px]">
            <h4 className="flex items-center gap-1.5 font-serif font-bold text-oriental-crimson dark:text-amber-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              Điểm đặc trưng phiên bản này
            </h4>
            <ul className="space-y-1.5 text-[12.5px] text-stone-600 dark:text-slate-300">
              <li className="flex gap-2"><span className="text-amber-600">◆</span>Địa bàn chuẩn 4x4 truyền thống kèm Thiên Bàn 2x2.</li>
              <li className="flex gap-2"><span className="text-amber-600">◆</span>Minh bạch: Ghi chú đầy đủ các sao chưa kiểm chứng.</li>
              <li className="flex gap-2"><span className="text-amber-600">◆</span>Xuất file PDF khổ A4 ngang lưu trữ sắc nét.</li>
              <li className="flex gap-2"><span className="text-amber-600">◆</span>Múi giờ chuẩn Việt Nam UTC+7 (không hỏi nơi sinh).</li>
            </ul>
          </div>

          {/* Lá số mẫu */}
          <div className="pt-1">
            <span className="mb-2 block text-[12px] font-semibold text-amber-900 dark:text-amber-400">Thử nghiệm nhanh với lá số mẫu:</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => handleLoadSample('tv001')} className={sampleBtn}>
                Mẫu TV-001 (1970)
              </button>
              <button type="button" onClick={() => handleLoadSample('1999')} className={sampleBtn}>
                Mẫu 1999 (Kỷ Mão)
              </button>
            </div>
          </div>
        </div>

        {/* Cột phải: Form */}
        <div className="paper-card-double p-6 sm:p-7 lg:col-span-7">
          <div className="mb-5 flex items-center gap-2 border-b border-amber-900/15 pb-3 dark:border-slate-700">
            <Calendar className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-oriental-crimson dark:text-amber-400">Thông tin đương số</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Họ tên */}
            <div>
              <label htmlFor="name" className="field-label">
                Họ và tên <span className="text-[12px] font-normal text-stone-500 dark:text-slate-400">(không bắt buộc)</span>
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Tuệ"
                  className="field"
                />
                <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-amber-700/70" />
              </div>
            </div>

            {/* Giới tính */}
            <div>
              <span className="field-label">
                Giới tính <span className="text-red-600">*</span>
              </span>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Giới tính">
                {([
                  { v: 'nam', label: 'Nam', sub: 'Dương Nam / Âm Nam' },
                  { v: 'nu', label: 'Nữ', sub: 'Dương Nữ / Âm Nữ' },
                ] as const).map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    role="radio"
                    aria-checked={gender === opt.v}
                    onClick={() => setGender(opt.v)}
                    className={`cursor-pointer rounded-xl border px-4 py-2.5 text-left transition-all ${
                      gender === opt.v
                        ? 'border-oriental-gold bg-gradient-to-br from-amber-700 to-oriental-gold text-white shadow-md shadow-amber-900/20'
                        : 'border-[#e0d2b4] bg-white/60 text-stone-700 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="block text-[14px] font-bold">{opt.label}</span>
                    <span className={`block text-[11.5px] ${gender === opt.v ? 'text-amber-50/90' : 'text-stone-500 dark:text-slate-400'}`}>{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ngày sinh dương lịch */}
            <div>
              <label htmlFor="solarDate" className="field-label">
                Ngày sinh dương lịch <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="solarDate"
                  type="date"
                  min="1900-01-01"
                  max="2100-12-31"
                  value={solarDate}
                  aria-invalid={!!errors.date}
                  onChange={e => {
                    setSolarDate(e.target.value);
                    if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
                  }}
                  className="field"
                />
                <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-amber-700/70" />
              </div>
              {errors.date && (
                <p className="mt-1 text-[12px] font-medium text-red-600">{errors.date}</p>
              )}
              <p className="mt-1 text-[12px] text-stone-500 dark:text-slate-400">
                Hệ thống tự động quy đổi chính xác sang Âm lịch và Can Chi tương ứng.
              </p>
            </div>

            {/* Giờ sinh */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="time" className="field-label !mb-0">
                  Giờ sinh (24 giờ, HH:mm) {!unknownTime && <span className="text-red-600">*</span>}
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-stone-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={unknownTime}
                    onChange={e => {
                      setUnknownTime(e.target.checked);
                      if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
                    }}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Không rõ giờ sinh</span>
                </label>
              </div>

              <div className="relative">
                <input
                  id="time"
                  type="time"
                  disabled={unknownTime}
                  value={time}
                  aria-invalid={!!errors.time}
                  onChange={e => {
                    setTime(e.target.value);
                    if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
                  }}
                  className="field"
                />
                <Clock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-amber-700/70" />
              </div>

              {errors.time && (
                <p className="mt-1 text-[12px] font-medium text-red-600">{errors.time}</p>
              )}

              {!unknownTime && hourHelper && (
                <p className="mt-1.5 inline-block rounded-md bg-amber-100/80 px-2 py-0.5 text-[12px] font-semibold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
                  Thuộc: {hourHelper}
                </p>
              )}
              {unknownTime && (
                <p className="mt-1 text-[12px] italic text-amber-800 dark:text-amber-300">
                  Lưu ý: Không rõ giờ sinh sẽ không an Mệnh/Thân, 14 chính tinh và các sao phụ thuộc giờ.
                </p>
              )}
            </div>

            {/* Năm xem vận hạn */}
            <div>
              <label htmlFor="viewedYear" className="field-label">
                Năm xem vận hạn &amp; sao lưu niên
              </label>
              <select
                id="viewedYear"
                value={viewedYear}
                onChange={e => setViewedYear(parseInt(e.target.value, 10))}
                className="field no-icon"
              >
                {Array.from({ length: 201 }, (_, i) => 1900 + i).map(y => (
                  <option key={y} value={y}>
                    Năm {y} {y === 2026 ? '(Năm hiện tại - Bính Ngọ)' : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[12px] text-stone-500 dark:text-slate-400">
                Lớp sao lưu niên và tiểu hạn sẽ được kích hoạt theo năm xem đã chọn.
              </p>
            </div>

            {/* Hành động */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                className="btn btn-primary flex-1 !rounded-xl !py-3 !text-[15px] font-serif font-bold uppercase tracking-wider"
              >
                Lập Lá Số Tử Vi
              </button>
              <button type="button" onClick={handleReset} className="btn btn-outline !rounded-xl !px-5 !py-3 !text-[14px]">
                Xóa thông tin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
