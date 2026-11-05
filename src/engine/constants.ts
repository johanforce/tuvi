export const HEAVENLY_STEMS = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'] as const;
export const EARTHLY_BRANCHES = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'] as const;
export type StemIndex = 0|1|2|3|4|5|6|7|8|9;
export type BranchIndex = 0|1|2|3|4|5|6|7|8|9|10|11;
export type Gender = 'nam'|'nu';
export const PALACE_NAMES = ['Mệnh','Phụ Mẫu','Phúc Đức','Điền Trạch','Quan Lộc','Nô Bộc','Thiên Di','Tật Ách','Tài Bạch','Tử Tức','Phu Thê','Huynh Đệ'] as const;
export const mod = (n:number,m:number=12):number => ((n % m)+m)%m;
export const stemName = (i:number):string => HEAVENLY_STEMS[mod(i,10)]!;
export const branchName = (i:number):string => EARTHLY_BRANCHES[mod(i,12)]!;

export const BRANCH_NAMES = EARTHLY_BRANCHES;
export const STEM_NAMES = HEAVENLY_STEMS;
