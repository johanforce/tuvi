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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cột trái: Giới thiệu & Triết lý */}
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/80 text-amber-900 border border-amber-300 rounded-full text-[12px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Thuật Toán Chuẩn Hóa Theo Tuvi.vn</span>
          </div>

          <h1 className="font-classical text-3xl md:text-4xl font-black text-[#8c2d19] tracking-tight leading-tight">
            LẬP LÁ SỐ TỬ VI
          </h1>

          <p className="text-stone-600 text-[14px] leading-relaxed">
            Nhập ngày giờ sinh dương lịch để lập lá số theo địa bàn 4x4 truyền thống. Toàn bộ 14 chính tinh, phụ tinh, vòng Tràng Sinh, Bác Sĩ, Thái Tuế và các lớp sao Lưu Niên v0.2.4 được hiển thị trực quan.
          </p>

          <div className="bg-[#faf6ed] p-4 rounded-xl border border-[#d8c8b0] text-[13px] text-stone-700 space-y-2">
            <h4 className="font-bold text-[#8c2d19] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Điểm đặc trưng phiên bản này:
            </h4>
            <ul className="space-y-1.5 text-stone-600 text-[12.5px]">
              <li>• Địa bàn chuẩn 4x4 truyền thống kèm Thiên Bàn 2x2.</li>
              <li>• Minh bạch: Ghi chú đầy đủ các sao chưa kiểm chứng.</li>
              <li>• Xuất file PDF khổ A4 ngang lưu trữ sắc nét.</li>
              <li>• Múi giờ chuẩn Việt Nam UTC+7 (không hỏi nơi sinh).</li>
            </ul>
          </div>

          {/* Nút thử nghiệm nhanh */}
          <div className="pt-2">
            <span className="text-[12px] text-stone-500 font-semibold block mb-2">Thử nghiệm nhanh với lá số mẫu:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('tv001')}
                className="px-3 py-1.5 text-[12px] font-medium bg-white hover:bg-stone-50 border border-[#d8c8b0] rounded-lg text-stone-700 transition-colors cursor-pointer"
              >
                Mẫu TV-001 (1970)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('1999')}
                className="px-3 py-1.5 text-[12px] font-medium bg-white hover:bg-stone-50 border border-[#d8c8b0] rounded-lg text-stone-700 transition-colors cursor-pointer"
              >
                Mẫu 1999 (Kỷ Mão)
              </button>
            </div>
          </div>
        </div>

        {/* Cột phải: Form nhập thông tin */}
        <div className="lg:col-span-7 bg-[#fffdfa] border-2 border-[#b8a082] rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Họ tên */}
            <div>
              <label htmlFor="name" className="block text-[13.5px] font-bold text-stone-800 mb-1">
                Họ và tên <span className="font-normal text-stone-600 text-[12px]">(không bắt buộc)</span>
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Tuệ"
                  className="w-full pl-9 pr-3 py-2 text-[14px] bg-[#faf8f2] border border-[#d8c8b0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c2d19] focus:bg-white text-stone-900"
                />
                <User className="w-4 h-4 text-stone-600 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-[13.5px] font-bold text-stone-800 mb-1">
                Giới tính <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('nam')}
                  className={`py-2.5 px-4 rounded-lg font-bold text-[14px] border transition-all cursor-pointer ${
                    gender === 'nam'
                      ? 'bg-[#8c2d19] text-amber-50 border-[#8c2d19] shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-[#d8c8b0] hover:bg-stone-100'
                  }`}
                >
                  Nam (Dương Nam / Âm Nam)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('nu')}
                  className={`py-2.5 px-4 rounded-lg font-bold text-[14px] border transition-all cursor-pointer ${
                    gender === 'nu'
                      ? 'bg-[#8c2d19] text-amber-50 border-[#8c2d19] shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-[#d8c8b0] hover:bg-stone-100'
                  }`}
                >
                  Nữ (Dương Nữ / Âm Nữ)
                </button>
              </div>
            </div>

            {/* Ngày sinh dương lịch */}
            <div>
              <label htmlFor="solarDate" className="block text-[13.5px] font-bold text-stone-800 mb-1">
                Ngày sinh dương lịch <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="solarDate"
                  type="date"
                  min="1900-01-01"
                  max="2100-12-31"
                  value={solarDate}
                  onChange={e => {
                    setSolarDate(e.target.value);
                    if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-[14px] bg-[#faf8f2] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c2d19] focus:bg-white text-stone-900 ${
                    errors.date ? 'border-red-500' : 'border-[#d8c8b0]'
                  }`}
                />
                <Calendar className="w-4 h-4 text-stone-600 absolute left-3 top-3 pointer-events-none" />
              </div>
              {errors.date && (
                <p className="text-red-600 text-[12px] mt-1 font-medium">{errors.date}</p>
              )}
              <p className="text-[12px] text-stone-600 mt-1">
                Hệ thống tự động quy đổi chính xác sang Âm lịch và Can Chi tương ứng.
              </p>
            </div>

            {/* Giờ sinh & Checkbox không rõ giờ */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="time" className="block text-[13.5px] font-bold text-stone-800">
                  Giờ sinh (24 giờ, HH:mm) {!unknownTime && <span className="text-red-600">*</span>}
                </label>
                <label className="flex items-center gap-1.5 text-[12px] text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={unknownTime}
                    onChange={e => {
                      setUnknownTime(e.target.checked);
                      if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
                    }}
                    className="rounded text-amber-700 focus:ring-amber-500"
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
                  onChange={e => {
                    setTime(e.target.value);
                    if (errors.time) setErrors(prev => ({ ...prev, time: undefined }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-[14px] bg-[#faf8f2] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c2d19] focus:bg-white text-stone-900 disabled:opacity-50 disabled:bg-stone-200 ${
                    errors.time ? 'border-red-500' : 'border-[#d8c8b0]'
                  }`}
                />
                <Clock className="w-4 h-4 text-stone-600 absolute left-3 top-3 pointer-events-none" />
              </div>

              {errors.time && (
                <p className="text-red-600 text-[12px] mt-1 font-medium">{errors.time}</p>
              )}

              {/* Trợ giúp giờ Can Chi */}
              {!unknownTime && hourHelper && (
                <p className="text-[12px] font-semibold text-amber-800 mt-1">
                  Thuộc: {hourHelper}
                </p>
              )}
              {unknownTime && (
                <p className="text-[12px] text-amber-800 mt-1 italic">
                  Lưu ý: Không rõ giờ sinh sẽ không an Mệnh/Thân, 14 chính tinh và các sao phụ thuộc giờ.
                </p>
              )}
            </div>

            {/* Năm xem vận hạn */}
            <div>
              <label htmlFor="viewedYear" className="block text-[13.5px] font-bold text-stone-800 mb-1">
                Năm xem vận hạn & sao lưu niên
              </label>
              <select
                id="viewedYear"
                value={viewedYear}
                onChange={e => setViewedYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-[14px] bg-[#faf8f2] border border-[#d8c8b0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c2d19] focus:bg-white text-stone-900"
              >
                {Array.from({ length: 201 }, (_, i) => 1900 + i).map(y => (
                  <option key={y} value={y}>
                    Năm {y} {y === 2026 ? '(Năm hiện tại - Bính Ngọ)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-[12px] text-stone-600 mt-1">
                Lớp sao lưu niên và tiểu hạn sẽ được kích hoạt theo năm xem đã chọn.
              </p>
            </div>

            {/* Nút hành động */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 py-3 px-6 bg-[#8c2d19] hover:bg-[#722313] text-amber-50 font-classical font-black text-[15px] uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
              >
                LẬP LÁ SỐ TỬ VI
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-5 bg-white hover:bg-stone-50 text-stone-700 border border-[#d8c8b0] font-semibold text-[14px] rounded-xl transition-colors cursor-pointer"
              >
                Xóa thông tin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
