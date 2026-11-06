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

  // Lấy màu chữ chuẩn xác theo ngũ hành
  const getTextColor = () => {
    switch (element) {
      case 'kim':
        return 'text-[#6b7280]'; // Xám bạc
      case 'moc':
        return 'text-[#279653]'; // Xanh lá
      case 'thuy':
        return 'text-[#2787CE]'; // Xanh dương
      case 'hoa':
        return 'text-[#D94A40]'; // Đỏ
      case 'tho':
        return 'text-[#A87943]'; // Vàng đất
      default:
        return 'text-[#374151]';
    }
  };

  const brightness = getStarBrightness(star.id, branch);
  const sign = isMain ? getStarSign(star.id) : '';

  // Định dạng tên sao: nếu là sao lưu thì có tiền tố L.
  const isAnnual = star.scope === 'annual';
  let displayName = star.name;
  if (isAnnual && !displayName.startsWith('L.')) {
    displayName = displayName.replace(/^Lưu\s+/, 'L.');
  }

  // 14 Chính tinh: hiển thị đậm, in hoa, kèm dấu + / - và độ sáng (M), (V), (Đ), (B), (H)
  if (isMain) {
    return (
      <div 
        className={`font-bold text-[12px] md:text-[13px] leading-tight select-none ${getTextColor()}`}
        title={`Chính tinh: ${star.name} (${element?.toUpperCase() || ''})`}
      >
        <span>{sign}</span>
        <span className="uppercase tracking-tight">{star.name}</span>
        {brightness && (
          <span className="text-[11px] font-semibold ml-0.5">
            ({brightness})
          </span>
        )}
      </div>
    );
  }

  // Phụ tinh: chữ thanh, gọn gàng, định dạng chính xác như fixture
  return (
    <div 
      className={`text-[11px] md:text-[11.5px] leading-[1.3] font-medium whitespace-nowrap select-none ${getTextColor()}`}
      title={`${star.name} (${element?.toUpperCase() || ''})`}
    >
      <span>{displayName}</span>
      {brightness && (
        <span className="text-[10px] ml-0.5">
          ({brightness})
        </span>
      )}
    </div>
  );
};
