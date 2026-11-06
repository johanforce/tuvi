import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from '../engine/constants.js';

// Viết tắt Thiên Can: Giáp -> G., Ất -> Ấ., Bính -> B., Đinh -> Đ., Mậu -> M., Kỷ -> K., Canh -> C., Tân -> T., Nhâm -> N., Quý -> Q.
const STEM_ABBR: Record<number, string> = {
  0: 'G.',
  1: 'Ấ.',
  2: 'B.',
  3: 'Đ.',
  4: 'M.',
  5: 'K.',
  6: 'C.',
  7: 'T.',
  8: 'N.',
  9: 'Q.',
};

// Âm dương và ngũ hành của 12 địa chi cung
const BRANCH_ELEMENT_INFO: Record<number, string> = {
  0: '+Thủy',  // Tý
  1: '-Thổ',   // Sửu
  2: '+Mộc',   // Dần
  3: '-Mộc',   // Mão
  4: '+Thổ',   // Thìn
  5: '-Hỏa',   // Tỵ
  6: '+Hỏa',   // Ngọ
  7: '-Thổ',   // Mùi
  8: '+Kim',   // Thân
  9: '-Kim',   // Dậu
  10: '+Thổ',  // Tuất
  11: '-Thủy', // Hợi
};
const BRANCH_ELEMENT_COLORS: Record<string, string> = {
  Kim: '#5b666e', Mộc: '#279653', Thủy: '#2787CE', Hỏa: '#D94A40', Thổ: '#FFD700',
};

export function getPalaceCanChiAbbr(stem: number, branch: number): string {
  const abbr = STEM_ABBR[stem % 10] || '';
  const brName = EARTHLY_BRANCHES[branch % 12]  || '';
  return `${abbr}${brName}`;
}

export function getBranchElementInfo(branch: number): string {
  return BRANCH_ELEMENT_INFO[branch % 12] || '';
}

export function getBranchElementColor(branch: number): string {
  const info = getBranchElementInfo(branch);
  return BRANCH_ELEMENT_COLORS[info.slice(1)] || '#111827';
}

// Màu tiêu đề cung như trong fixture tuvidauso.ai.studio
export function getPalaceNameColor(palaceName: string, isThan: boolean): string {
  if (palaceName.includes('Mệnh') || isThan) {
    return 'text-[#d97706]'; // Cam / hổ phách
  }
  switch (palaceName) {
    case 'Huynh Đệ':
    case 'Tật Ách':
      return 'text-[#dc2626]'; // Đỏ
    case 'Phu Thê':
      return 'text-[#6b7280]'; // Kim
    case 'Tài Bạch':
    case 'Thiên Di':
      return 'text-[#16a34a]'; // Xanh lá
    case 'Điền Trạch':
    case 'Tử Tức':
      return 'text-[#d97706]'; // Cam
    case 'Phụ Mẫu':
    case 'Phúc Đức':
      return 'text-[#4b5563]'; // Xám chì
    case 'Quan Lộc':
    case 'Nô Bộc':
    default:
      return 'text-[#111827]'; // Đen đậm
  }
}

// Tính tương quan sinh khắc giữa Ngũ Hành Bản Mệnh và Cục
export function getMenhCucRelation(napAmLabel: string, bureauName: string): string {
  // Trích xuất hành mệnh
  let menhElem = '';
  if (napAmLabel.includes('Kim')) menhElem = 'Kim';
  else if (napAmLabel.includes('Mộc')) menhElem = 'Mộc';
  else if (napAmLabel.includes('Thủy')) menhElem = 'Thủy';
  else if (napAmLabel.includes('Hỏa')) menhElem = 'Hỏa';
  else if (napAmLabel.includes('Thổ')) menhElem = 'Thổ';

  // Trích xuất hành cục
  let cucElem = '';
  if (bureauName.includes('Kim')) cucElem = 'Kim';
  else if (bureauName.includes('Mộc')) cucElem = 'Mộc';
  else if (bureauName.includes('Thủy')) cucElem = 'Thủy';
  else if (bureauName.includes('Hỏa')) cucElem = 'Hỏa';
  else if (bureauName.includes('Thổ')) cucElem = 'Thổ';

  if (!menhElem || !cucElem) return '';

  if (menhElem === cucElem) return 'Mệnh Cục đồng hành';

  // Quy luật sinh khắc
  const sinh: Record<string, string> = { Kim: 'Thủy', Thủy: 'Mộc', Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim' };
  const khac: Record<string, string> = { Kim: 'Mộc', Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim' };

  if (sinh[menhElem] === cucElem) return `Mệnh ${menhElem} sinh Cục ${cucElem}`;
  if (sinh[cucElem] === menhElem) return `Cục ${cucElem} sinh Mệnh ${menhElem}`;
  if (khac[menhElem] === cucElem) return `Mệnh ${menhElem} khắc Cục ${cucElem}`;
  if (khac[cucElem] === menhElem) return `Cục ${cucElem} khắc Mệnh ${menhElem}`;

  return '';
}
