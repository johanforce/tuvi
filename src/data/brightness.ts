/**
 * Bảng âm dương và độ sáng (Miếu, Vượng, Đắc, Bình hòa, Hãm địa) của 14 chính tinh
 * và các phụ tinh tiêu biểu qua 12 địa chi theo chuẩn Tuvi.vn.
 *
 * Chỉ số Chi: 0: Tý, 1: Sửu, 2: Dần, 3: Mão, 4: Thìn, 5: Tỵ, 6: Ngọ, 7: Mùi, 8: Thân, 9: Dậu, 10: Tuất, 11: Hợi.
 */

export interface StarBrightnessMeta {
  sign: '+' | '-'; // +: Dương tinh, -: Âm tinh
  element: 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';
  brightness: Record<number, 'M' | 'V' | 'Đ' | 'B' | 'H'>;
}

export const MAIN_STARS_BRIGHTNESS: Record<string, StarBrightnessMeta> = {
  'tu-vi': {
    sign: '+',
    element: 'tho',
    brightness: { 0: 'B', 1: 'Đ', 2: 'M', 3: 'B', 4: 'V', 5: 'Đ', 6: 'M', 7: 'Đ', 8: 'M', 9: 'B', 10: 'V', 11: 'B' },
  },
  'liem-trinh': {
    sign: '-',
    element: 'hoa',
    brightness: { 0: 'V', 1: 'Đ', 2: 'V', 3: 'H', 4: 'V', 5: 'H', 6: 'V', 7: 'Đ', 8: 'V', 9: 'B', 10: 'V', 11: 'H' },
  },
  'dong-trinh': {
    sign: '-',
    element: 'hoa',
    brightness: { 0: 'V', 1: 'Đ', 2: 'V', 3: 'H', 4: 'V', 5: 'H', 6: 'V', 7: 'Đ', 8: 'V', 9: 'B', 10: 'V', 11: 'H' },
  },
  'thien-dong': {
    sign: '-',
    element: 'thuy',
    brightness: { 0: 'V', 1: 'H', 2: 'M', 3: 'Đ', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'M', 9: 'H', 10: 'H', 11: 'Đ' },
  },
  'vu-khuc': {
    sign: '-',
    element: 'kim',
    brightness: { 0: 'V', 1: 'M', 2: 'V', 3: 'Đ', 4: 'M', 5: 'B', 6: 'V', 7: 'M', 8: 'V', 9: 'Đ', 10: 'M', 11: 'H' },
  },
  'thai-duong': {
    sign: '+',
    element: 'hoa',
    brightness: { 0: 'H', 1: 'Đ', 2: 'V', 3: 'V', 4: 'V', 5: 'M', 6: 'M', 7: 'B', 8: 'B', 9: 'H', 10: 'H', 11: 'H' },
  },
  'thien-co': {
    sign: '+',
    element: 'moc',
    brightness: { 0: 'Đ', 1: 'H', 2: 'Đ', 3: 'M', 4: 'M', 5: 'B', 6: 'M', 7: 'H', 8: 'Đ', 9: 'M', 10: 'M', 11: 'B' },
  },
  'thien-phu': {
    sign: '+',
    element: 'tho',
    brightness: { 0: 'M', 1: 'M', 2: 'M', 3: 'B', 4: 'M', 5: 'B', 6: 'V', 7: 'M', 8: 'M', 9: 'B', 10: 'M', 11: 'B' },
  },
  'thai-am': {
    sign: '-',
    element: 'thuy',
    brightness: { 0: 'M', 1: 'Đ', 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'B', 8: 'V', 9: 'M', 10: 'M', 11: 'M' },
  },
  'tham-lang': {
    sign: '-',
    element: 'thuy',
    brightness: { 0: 'V', 1: 'M', 2: 'Đ', 3: 'H', 4: 'M', 5: 'H', 6: 'V', 7: 'M', 8: 'Đ', 9: 'H', 10: 'M', 11: 'H' },
  },
  'cu-mon': {
    sign: '-',
    element: 'thuy',
    brightness: { 0: 'V', 1: 'H', 2: 'M', 3: 'M', 4: 'H', 5: 'H', 6: 'V', 7: 'H', 8: 'H', 9: 'M', 10: 'H', 11: 'V' },
  },
  'thien-tuong': {
    sign: '+',
    element: 'thuy',
    brightness: { 0: 'V', 1: 'Đ', 2: 'M', 3: 'H', 4: 'V', 5: 'Đ', 6: 'V', 7: 'Đ', 8: 'M', 9: 'H', 10: 'V', 11: 'Đ' },
  },
  'thien-luong': {
    sign: '+',
    element: 'moc',
    brightness: { 0: 'V', 1: 'V', 2: 'M', 3: 'M', 4: 'V', 5: 'H', 6: 'M', 7: 'V', 8: 'V', 9: 'H', 10: 'M', 11: 'H' },
  },
  'that-sat': {
    sign: '+',
    element: 'kim',
    brightness: { 0: 'M', 1: 'Đ', 2: 'M', 3: 'H', 4: 'H', 5: 'Đ', 6: 'M', 7: 'Đ', 8: 'M', 9: 'H', 10: 'H', 11: 'H' },
  },
  'pha-quan': {
    sign: '-',
    element: 'thuy',
    brightness: { 0: 'M', 1: 'V', 2: 'H', 3: 'H', 4: 'Đ', 5: 'H', 6: 'M', 7: 'V', 8: 'H', 9: 'H', 10: 'Đ', 11: 'H' },
  },
};

// Độ sáng cho phụ tinh (Kình Dương, Đà La, Hỏa Tinh, Linh Tinh, Địa Không, Địa Kiếp, Văn Xương, Văn Khúc, Lộc Tồn, Thiên Mã, v.v.)
export const SECONDARY_STARS_BRIGHTNESS: Record<string, Record<number, 'M' | 'V' | 'Đ' | 'B' | 'H'>> = {
  'kinh-duong': { 1: 'Đ', 4: 'Đ', 7: 'Đ', 10: 'Đ', 0: 'H', 2: 'H', 3: 'H', 5: 'H', 6: 'H', 8: 'H', 9: 'H', 11: 'H' },
  'da-la': { 1: 'Đ', 4: 'Đ', 7: 'Đ', 10: 'Đ', 0: 'H', 2: 'H', 3: 'H', 5: 'H', 6: 'H', 8: 'H', 9: 'H', 11: 'H' },
  'hoa-tinh': { 2: 'Đ', 3: 'Đ', 4: 'Đ', 5: 'Đ', 6: 'Đ', 7: 'Đ', 0: 'H', 1: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  'linh-tinh': { 2: 'Đ', 3: 'Đ', 4: 'Đ', 5: 'Đ', 6: 'Đ', 7: 'Đ', 0: 'H', 1: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
  'dia-khong': { 5: 'Đ', 11: 'Đ', 0: 'H', 1: 'H', 2: 'H', 3: 'H', 4: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H' },
  'dia-kiep': { 5: 'Đ', 11: 'Đ', 0: 'H', 1: 'H', 2: 'H', 3: 'H', 4: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H' },
  'van-xuong': { 1: 'Đ', 4: 'Đ', 5: 'Đ', 10: 'Đ', 2: 'H', 6: 'H', 8: 'H' },
  'van-khuc': { 1: 'Đ', 4: 'Đ', 5: 'Đ', 10: 'Đ', 2: 'H', 6: 'H', 8: 'H' },
  'loc-ton': { 0: 'B', 1: 'B', 2: 'B', 3: 'B', 4: 'B', 5: 'B', 6: 'B', 7: 'B', 8: 'B', 9: 'B', 10: 'B', 11: 'B' },
  'thien-ma': { 2: 'Đ', 5: 'Đ', 8: 'H', 11: 'H' },
  'thien-khoc': { 0: 'Đ', 1: 'Đ', 6: 'Đ', 7: 'Đ', 3: 'H', 9: 'H' },
  'thien-hu': { 0: 'Đ', 1: 'Đ', 6: 'Đ', 7: 'Đ', 3: 'H', 9: 'H' },
  'thien-hinh': { 2: 'Đ', 3: 'Đ', 9: 'Đ', 10: 'Đ' },
  'thien-dieu': { 3: 'Đ', 9: 'Đ', 10: 'Đ', 11: 'Đ' },
};

export function getStarBrightness(starId: string, branch: number): string | undefined {
  if (MAIN_STARS_BRIGHTNESS[starId]) {
    return MAIN_STARS_BRIGHTNESS[starId].brightness[branch];
  }
  if (SECONDARY_STARS_BRIGHTNESS[starId]) {
    return SECONDARY_STARS_BRIGHTNESS[starId][branch];
  }
  return undefined;
}

export function getStarSign(starId: string): '+' | '-' | '' {
  if (MAIN_STARS_BRIGHTNESS[starId]) {
    return MAIN_STARS_BRIGHTNESS[starId].sign;
  }
  return '';
}
