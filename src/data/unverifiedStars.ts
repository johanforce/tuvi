/**
 * Trạng thái kiểm chứng của công thức an sao và dữ liệu độ sáng.
 * Công thức an sao đã được người dùng xác nhận; bảng độ sáng vẫn là một dữ liệu riêng.
 */

export interface UnverifiedStarInfo {
  id: string;
  name: string;
  category: 'formula_verified' | 'brightness_unverified';
  categoryLabel: string;
  reason: string;
  details: string;
  sourceNote: string;
}

export const UNVERIFIED_STARS_LIST: UnverifiedStarInfo[] = [
  {
    id: 'formulas',
    name: 'Công thức an sao',
    category: 'formula_verified',
    categoryLabel: 'Đã xác nhận',
    reason: 'Các công thức an sao đang được triển khai trong engine',
    details: 'Các công thức an sao đã được người dùng xác nhận là đúng. Các trạng thái ứng viên hoặc mâu thuẫn cũ không còn áp dụng cho công thức hiện hành.',
    sourceNote: 'Xác nhận của người dùng, ngày 07/11/2026',
  },
  {
    id: 'do-sang-sao',
    name: 'Độ sáng sao (Miếu, Vượng, Đắc, Bình, Hãm)',
    category: 'brightness_unverified',
    categoryLabel: 'Chưa xác nhận nguồn',
    reason: 'Bảng độ sáng là dữ liệu riêng, không phải công thức an sao',
    details: 'Các mức độ sáng chỉ được dùng khi có dữ liệu trong bảng hiện hành. Bảng nguồn và độ bao phủ đầy đủ của các sao vẫn cần được xác nhận riêng.',
    sourceNote: 'star-metadata.ts / brightness.ts',
  },
];
