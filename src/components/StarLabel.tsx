import React from 'react';
import type { StarPlacement } from '../engine/types.js';
import { STAR_META } from '../catalog/star-metadata.js';
import { getStarBrightness, getStarSign } from '../data/brightness.js';

interface StarLabelProps {
  star: StarPlacement;
  branch: number;
  isMain?: boolean;
}

export const StarLabel: React.FC<StarLabelProps> = ({ star, branch, isMain = false }) => {
  const meta = STAR_META[star.id] ?? STAR_META[star.id.replace(/^luu-/, '')];
  let element = meta?.element;

  // Xử lý ngũ hành cho các sao đặc thù nếu chưa có trong metadata
  if (!element) {
    if (star.id === 'luu-van-tinh') element = 'hoa';
    else if (star.id.includes('hoa-loc') || star.name.includes('Hóa Lộc')) element = 'moc';
    else if (star.id.includes('hoa-quyen') || star.name.includes('Hóa Quyền')) element = 'thuy';
    else if (star.id.includes('hoa-khoa') || star.name.includes('Hóa Khoa')) element = 'kim';
    else if (star.id.includes('hoa-ky') || star.name.includes('Hóa Kỵ')) element = 'thuy';
    else if (star.id.includes('bach-ho') || star.name.includes('Bạch Hổ')) element = 'kim';
    else if (star.id.includes('tang-mon') || star.name.includes('Tang Môn')) element = 'moc';
    else if (star.name.includes('Thiếu Âm')) element = 'thuy';
    else if (star.name.includes('Tử Phù')) element = 'kim';
    else if (star.id.includes('thai-tue') || star.name.includes('Thái Tuế')) element = 'hoa';
    else if (star.id.includes('thieu-duong') || star.name.includes('Thiếu Dương')) element = 'hoa';
    else if (star.id.includes('thieu-am')) element = 'thuy';
    else if (star.id.includes('quan-phu') || star.name.includes('Quan Phù')) element = 'hoa';
    else if (star.id.includes('tu-phu')) element = 'kim';
    else if (star.id.includes('tue-pha') || star.name.includes('Tuế Phá')) element = 'hoa';
    else if (star.name.includes('Long Đức')) element = 'thuy';
    else if (star.id.includes('phuc-duc') || star.name.includes('Phúc Đức')) element = 'tho';
    else if (star.id.includes('dieu-khach') || star.name.includes('Điếu Khách')) element = 'hoa';
    else if (star.id.includes('truc-phu') || star.name.includes('Trực Phù')) element = 'hoa';
    else if (star.id.includes('luc-si') || star.name.includes('Lực Sĩ')) element = 'thuy';
    else if (star.name.includes('Quan Phủ')) element = 'hoa';
    else if (star.id.includes('thanh-long') || star.name.includes('Thanh Long')) element = 'thuy';
    else if (star.id.includes('tieu-hao') || star.name.includes('Tiểu Hao')) element = 'hoa';
    else if (star.id.includes('tuong-quan') || star.name.includes('Tướng Quân')) element = 'moc';
    else if (star.id.includes('tau-thu') || star.name.includes('Tấu Thư')) element = 'kim';
    else if (star.id.includes('phi-liem') || star.name.includes('Phi Liêm')) element = 'hoa';
    else if (star.id.includes('hy-than') || star.name.includes('Hỷ Thần')) element = 'hoa';
    else if (star.id.includes('benh-phu') || star.name.includes('Bệnh Phù')) element = 'tho';
    else if (star.id.includes('dai-hao') || star.name.includes('Đại Hao')) element = 'hoa';
    else if (star.id.includes('phuc-binh') || star.name.includes('Phục Binh')) element = 'hoa';
  }

  // Màu chữ theo ngũ hành (lấy từ token trong tuvi-theme.css)
  const ELEMENT_TEXT: Record<string, string> = {
    kim: 'text-element-kim',
    moc: 'text-element-moc',
    thuy: 'text-element-thuy',
    hoa: 'text-element-hoa',
    tho: 'text-element-tho',
  };
  const textColor = (element && ELEMENT_TEXT[element]) || 'text-stone-600';

  // Nhãn độ sáng: M Miếu, V Vượng, Đ Đắc, B Bình, H Hãm
  const BRIGHTNESS_PILL: Record<string, string> = {
    M: 'bg-rose-100 text-rose-700',
    V: 'bg-blue-100 text-blue-700',
    'Đ': 'bg-emerald-100 text-emerald-700',
    B: 'bg-amber-100 text-amber-700',
    H: 'bg-slate-200 text-slate-600',
  };
  const BRIGHTNESS_TEXT: Record<string, string> = {
    M: 'text-rose-600',
    V: 'text-blue-600',
    'Đ': 'text-emerald-600',
    B: 'text-amber-600',
    H: 'text-slate-500',
  };

  const brightness = getStarBrightness(star.id, branch);
  const brightnessKey = brightness ? String(brightness).charAt(0).toUpperCase() : '';
  const pillClass = BRIGHTNESS_PILL[brightnessKey] || 'bg-stone-100 text-stone-600';
  const brightnessTextClass = BRIGHTNESS_TEXT[brightnessKey] || 'text-stone-500';
  const sign = isMain ? getStarSign(star.id) : '';

  // Định dạng tên sao: nếu là sao lưu thì có tiền tố L.
  const isAnnual = star.scope === 'annual';
  let displayName = star.name;
  if (isAnnual && !displayName.startsWith('L.')) {
    displayName = displayName.replace(/^Lưu\s+/, 'L.');
  }
  const isTransform = star.id.includes('hoa-') || star.name.includes('Hóa');

  // 14 Chính tinh: đậm, cỡ lớn, kèm dấu + / - và nhãn độ sáng dạng huy hiệu
  if (isMain) {
    return (
      <div
        className={`inline-flex items-center gap-1 text-[13px] font-bold leading-tight select-none md:text-sm ${textColor}`}
        title={`Chính tinh: ${star.name} (${element?.toUpperCase() || ''})`}
      >
        {sign && <span className="text-[11px] opacity-70">{sign}</span>}
        <span className="tracking-tight">{star.name}</span>
        {brightness && (
          <span className={`rounded px-1 text-[10px] font-semibold leading-[1.1rem] ${pillClass}`}>
            {brightness}
          </span>
        )}
      </div>
    );
  }

  // Phụ tinh: gọn, thanh; Tứ Hóa đậm hơn để dễ nhận
  return (
    <div
      className={`whitespace-nowrap text-[11px] leading-[1.35] select-none md:text-[11.5px] ${isTransform ? 'font-bold' : 'font-medium'} ${textColor}`}
      title={`${star.name} (${element?.toUpperCase() || ''})`}
    >
      <span>{displayName}</span>
      {brightness && (
        <span className={`ml-0.5 text-[10px] font-semibold ${brightnessTextClass}`}>
          ({brightness})
        </span>
      )}
    </div>
  );
};
