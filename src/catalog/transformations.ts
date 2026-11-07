import type { StarPlacement } from '../engine/types.js';
import { mod } from '../engine/constants.js';

// Four transformations by birth-year heavenly stem. Table retained from project spec v1.3.
const TABLE:Record<number,[string,string,string,string]>={
  0:['liem-trinh','pha-quan','vu-khuc','thai-duong'],
  1:['thien-co','thien-luong','tu-vi','thai-am'],
  2:['thien-dong','thien-co','van-xuong','liem-trinh'],
  3:['thai-am','thien-dong','thien-co','cu-mon'],
  4:['tham-lang','thai-am','huu-bat','thien-co'],
  5:['vu-khuc','tham-lang','thien-luong','van-khuc'],
  6:['thai-duong','vu-khuc','thai-am','thien-dong'],
  7:['cu-mon','thai-duong','van-khuc','van-xuong'],
  8:['thien-luong','tu-vi','ta-phu','vu-khuc'],
  9:['pha-quan','cu-mon','thai-am','tham-lang'],
};
const NAMES=['Hóa Lộc','Hóa Quyền','Hóa Khoa','Hóa Kỵ'];
export function placeBirthTransformations(yearStem:number,starBranches:Map<string,number>):StarPlacement[]{
  const row=TABLE[mod(yearStem,10)]!;
  return row.map((id,i)=>({id:`hoa-${['loc','quyen','khoa','ky'][i]}`,name:NAMES[i]!,branch:starBranches.get(id)??-1,scope:'natal' as const,status:'USER_VERIFIED' as const,note:`Tứ Hóa theo Can năm sinh; sao đích ${id}`})).filter(x=>x.branch>=0);
}

/** Lưu Tứ Hóa: dùng Can năm xem, bám lên vị trí sao gốc của lá số.
 * Bảng cùng cấu trúc với Tứ Hóa bản mệnh; vị trí sao đích không di chuyển.
 * Công thức an Lưu Tứ Hóa đã được người dùng xác nhận.
 */
export function placeAnnualTransformations(yearStem:number,starBranches:Map<string,number>):StarPlacement[]{
  const row=TABLE[mod(yearStem,10)]!;
  return row.map((id,i)=>({id:`luu-hoa-${['loc','quyen','khoa','ky'][i]}`,name:`Lưu ${NAMES[i]}`,branch:starBranches.get(id)??-1,scope:'annual' as const,status:'USER_VERIFIED' as const,note:`Can năm xem; gắn lên sao gốc ${id}.`})).filter(x=>x.branch>=0);
}
