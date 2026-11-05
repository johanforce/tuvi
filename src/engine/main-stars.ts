import { mod } from './constants.js';
export interface MainStar { id:string; name:string; branch:number; }
export function getTuViBranch(lunarDay:number,bureauNumber:number):number {
  let x=0; while((lunarDay+x)%bureauNumber!==0)x++;
  const q=(lunarDay+x)/bureauNumber;
  const base=mod(2+q-1);
  return x%2===1?mod(base-x):mod(base+x);
}
export function getThienPhuBranch(tuViBranch:number):number { return mod(4-tuViBranch); }
export function place14MainStars(tuViBranch:number,thienPhuBranch:number):MainStar[] {
  const result:MainStar[]=[];
  const add=(id:string,name:string,branch:number)=>result.push({id,name,branch:mod(branch)});
  add('tu-vi','Tử Vi',tuViBranch);
  add('thien-co','Thiên Cơ',tuViBranch-1);
  add('thai-duong','Thái Dương',tuViBranch-3);
  add('vu-khuc','Vũ Khúc',tuViBranch-4);
  add('thien-dong','Thiên Đồng',tuViBranch-5);
  add('liem-trinh','Liêm Trinh',tuViBranch-8);
  add('thien-phu','Thiên Phủ',thienPhuBranch);
  add('thai-am','Thái Âm',thienPhuBranch+1);
  add('tham-lang','Tham Lang',thienPhuBranch+2);
  add('cu-mon','Cự Môn',thienPhuBranch+3);
  add('thien-tuong','Thiên Tướng',thienPhuBranch+4);
  add('thien-luong','Thiên Lương',thienPhuBranch+5);
  add('that-sat','Thất Sát',thienPhuBranch+6);
  add('pha-quan','Phá Quân',thienPhuBranch+10);
  return result;
}
