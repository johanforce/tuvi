import { mod, type Gender } from './constants.js';

/** Cung khởi Tiểu Hạn ở tuổi mụ 1, tra theo địa chi năm sinh. */
const TIEU_HAN_START_BY_BIRTH_BRANCH = [10, 7, 4, 1, 10, 7, 4, 1, 10, 7, 4, 1] as const;

/** Thứ tự 12 cung Lưu Niên Đại Hạn khi đi thuận từ LN.MỆNH. */
export const LUU_NIEN_PALACES = [
  'LN.MỆNH', 'LN.PHỤ', 'LN.PHÚC', 'LN.ĐIỀN', 'LN.QUAN', 'LN.NÔ',
  'LN.DI', 'LN.TẬT', 'LN.TÀI', 'LN.TỬ', 'LN.PHỐI', 'LN.HUYNH',
] as const;

export interface MonthLimitLabel {
  branch: number;
  month: number;
  label: string;
}

export interface GreatFortuneInfo {
  direction: 1 | -1;
  decadeIndex: number;
  startAge: number;
  endAge: number;
  yearInDecade: number;
  branch: number;
  luuNienMenhBranch: number;
}

/**
 * Tiểu Hạn: tuổi 1 khởi theo tam hợp Chi năm sinh; Nam thuận, Nữ nghịch.
 * Tuổi mụ = năm xem âm lịch - năm sinh âm lịch + 1.
 */
export function getTieuHanBranch(birthYearBranch: number, age: number, gender: Gender): number {
  if (!Number.isInteger(birthYearBranch) || birthYearBranch < 0 || birthYearBranch > 11) {
    throw new RangeError('Chi năm sinh phải nằm trong khoảng 0–11.');
  }
  if (!Number.isInteger(age) || age < 1) throw new RangeError('Tuổi mụ phải là số nguyên dương.');
  const start = TIEU_HAN_START_BY_BIRTH_BRANCH[birthYearBranch]!;
  const direction: 1 | -1 = gender === 'nam' ? 1 : -1;
  return mod(start + direction * (age - 1));
}

/**
 * Nguyệt hạn: từ cung Tiểu Hạn đếm nghịch tới tháng sinh; coi cung dừng là giờ Tý,
 * rồi đếm thuận theo giờ sinh. Cung nhận được là Th.1; các tháng sau đi thuận.
 */
export function getMonthLimitBranches(
  tieuHanBranch: number,
  birthLunarMonth: number,
  birthHourBranch: number,
): MonthLimitLabel[] {
  if (!Number.isInteger(tieuHanBranch) || tieuHanBranch < 0 || tieuHanBranch > 11) {
    throw new RangeError('Chi Tiểu Hạn phải nằm trong khoảng 0–11.');
  }
  if (!Number.isInteger(birthLunarMonth) || birthLunarMonth < 1 || birthLunarMonth > 12) {
    throw new RangeError('Tháng sinh âm lịch phải nằm trong khoảng 1–12.');
  }
  if (!Number.isInteger(birthHourBranch) || birthHourBranch < 0 || birthHourBranch > 11) {
    throw new RangeError('Chi giờ sinh phải nằm trong khoảng 0–11.');
  }
  const month1 = mod(tieuHanBranch - (birthLunarMonth - 1) + birthHourBranch);
  return Array.from({ length: 12 }, (_, index) => ({
    branch: mod(month1 + index),
    month: index + 1,
    label: `Th.${index + 1}`,
  }));
}

/**
 * Lưu Niên Đại Hạn theo quy tắc năm thứ 1–10 trong một Đại Hạn:
 * 1=D; 2=đối cung; 3=lùi một cung ngược chiều đại hạn; 4=đối cung;
 * 5–10 đi từng cung theo chiều đại hạn, năm 10 trở về D.
 */
export function getGreatFortuneInfo(
  menhBranch: number,
  bureauNumber: number,
  age: number,
  direction: 1 | -1,
): GreatFortuneInfo | undefined {
  if (!Number.isInteger(menhBranch) || menhBranch < 0 || menhBranch > 11) {
    throw new RangeError('Chi cung Mệnh phải nằm trong khoảng 0–11.');
  }
  if (!Number.isInteger(bureauNumber) || bureauNumber < 2 || bureauNumber > 6) {
    throw new RangeError('Số Cục phải nằm trong khoảng 2–6.');
  }
  if (!Number.isInteger(age) || age < 1) throw new RangeError('Tuổi mụ phải là số nguyên dương.');
  if (age < bureauNumber) return undefined;

  const decadeIndex = Math.floor((age - bureauNumber) / 10);
  const startAge = bureauNumber + decadeIndex * 10;
  const endAge = startAge + 9;
  const yearInDecade = age - startAge + 1;
  const branch = mod(menhBranch + direction * decadeIndex);
  const opposite = mod(branch + 6);

  let luuNienMenhBranch: number;
  if (yearInDecade === 1) luuNienMenhBranch = branch;
  else if (yearInDecade === 2 || yearInDecade === 4) luuNienMenhBranch = opposite;
  else if (yearInDecade === 3) luuNienMenhBranch = mod(opposite - direction);
  else luuNienMenhBranch = mod(opposite + direction * (yearInDecade - 4));

  return { direction, decadeIndex, startAge, endAge, yearInDecade, branch, luuNienMenhBranch };
}

/** Gán LN.MỆNH tại một Chi; 11 tên cung tiếp theo đi thuận theo vòng 12 Chi. */
export function getLuuNienPalaceNames(luuNienMenhBranch: number): Array<{ branch: number; name: string }> {
  if (!Number.isInteger(luuNienMenhBranch) || luuNienMenhBranch < 0 || luuNienMenhBranch > 11) {
    throw new RangeError('Chi LN.MỆNH phải nằm trong khoảng 0–11.');
  }
  return Array.from({ length: 12 }, (_, branch) => ({
    branch,
    name: LUU_NIEN_PALACES[mod(branch - luuNienMenhBranch)]!,
  }));
}
