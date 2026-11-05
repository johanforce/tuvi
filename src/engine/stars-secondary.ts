import { mod } from './constants.js';
import type { StarPlacement } from './types.js';
// Trung Châu: tháng 1/5/9=Tỵ; 2/6/10=Thân; 3/7/11=Dần; 4/8/12=Hợi.
const THIEN_VU_BY_MONTH = [5, 8, 2, 11, 5, 8, 2, 11, 5, 8, 2, 11] as const;
const PHA_TOAI_BY_YEAR_BRANCH = [5, 1, 9, 5, 1, 9, 5, 1, 9, 5, 1, 9] as const;
const p=(id:string,name:string,branch:number,status:StarPlacement['status']='CANDIDATE_SPEC',scope:'natal'|'annual'='natal'):StarPlacement=>({id,name,branch:mod(branch),status,scope});
export function placeMonthStars(month:number):StarPlacement[] {
  const m=month-1;
  return [p('ta-phu','Tả Phù',4+m,'CANDIDATE_IZTRO'),p('huu-bat','Hữu Bật',10-m,'CANDIDATE_IZTRO'),p('thien-hinh','Thiên Hình',9+m,'CANDIDATE_IZTRO'),p('thien-dieu','Thiên Diêu',1+m,'CANDIDATE_IZTRO'),p('thien-y','Thiên Y',1+m,'CONFLICT'),
    {...p('thien-vu','Thiên Vu',THIEN_VU_BY_MONTH[month-1]!,'CANDIDATE_SPEC'),note:'Quy tắc Trung Châu theo tháng sinh; chưa có fixture Tuvi.vn xác nhận trực tiếp.'},
    p('am-sat','Âm Sát',([2,0,10,8,6,4,2,0,10,8,6,4] as number[])[month-1]!,'CANDIDATE_IZTRO'),
    p('thien-nguyet','Thiên Nguyệt',([10,5,4,2,7,3,11,7,2,6,10,2] as number[])[month-1]!,'CANDIDATE_IZTRO')];
}
export function placeHourStars(hourBranch:number):StarPlacement[] {
  return [p('van-xuong','Văn Xương',10-hourBranch,'CANDIDATE_IZTRO'),p('van-khuc','Văn Khúc',4+hourBranch,'CANDIDATE_IZTRO'),p('thai-phu','Thai Phụ',6+hourBranch,'CANDIDATE_IZTRO'),p('phong-cao','Phong Cáo',2+hourBranch,'VERIFIED_TUVIVN')];
}
export function placeDayStars(day:number,taPhuBranch:number,huuBatBranch:number,vanXuongBranch:number,vanKhucBranch:number):StarPlacement[] {
  return [p('tam-thai','Tam Thai',taPhuBranch+day-1,'CANDIDATE_IZTRO'),p('bat-toa','Bát Tọa',huuBatBranch-day+1,'CANDIDATE_IZTRO'),p('an-quang','Ân Quang',vanXuongBranch+day-2,'CANDIDATE_IZTRO'),p('thien-quy','Thiên Quý',vanKhucBranch+day-2,'CANDIDATE_IZTRO')];
}
export function placeYearBranchStars(yearBranch:number,menhBranch:number,thanBranch:number):StarPlacement[] {
  const z=yearBranch;
  const peachByBranch=[9,6,3,0,9,6,3,0,9,6,3,0];
  const hoaCaiByBranch=[4,1,10,7,4,1,10,7,4,1,10,7];
  const kiepSatByBranch=[5,2,11,8,5,2,11,8,5,2,11,8];
  const coQuaByBranch=[{c:2,q:10},{c:2,q:10},{c:5,q:1},{c:5,q:1},{c:5,q:1},{c:8,q:4},{c:8,q:4},{c:8,q:4},{c:11,q:7},{c:11,q:7},{c:11,q:7},{c:2,q:10}];
  const coQua=coQuaByBranch[z]!;
  const thienMaByBranch=[2,11,8,5,2,11,8,5,2,11,8,5];
  return [p('thien-ma','Thiên Mã',thienMaByBranch[z]!,'CANDIDATE_SPEC'),
    p('pha-toai','Phá Toái',PHA_TOAI_BY_YEAR_BRANCH[z]!,'VERIFIED_TUVIVN','natal'),
    p('dao-hoa','Đào Hoa',peachByBranch[z]!,'VERIFIED_TUVIVN'),p('hong-loan','Hồng Loan',mod(3-z),'VERIFIED_TUVIVN'),p('thien-hy','Thiên Hỷ',mod(9-z),'VERIFIED_TUVIVN'),
    p('hoa-cai','Hoa Cái',hoaCaiByBranch[z]!,'CANDIDATE_IZTRO'),p('kiep-sat','Kiếp Sát',kiepSatByBranch[z]!,'CANDIDATE_IZTRO'),
    p('long-tri','Long Trì',4+z,'CANDIDATE_IZTRO'),p('phuong-cac','Phượng Các',10-z,'CANDIDATE_IZTRO'),p('thien-khoc','Thiên Khốc',6-z,'CANDIDATE_IZTRO'),p('thien-hu','Thiên Hư',6+z,'CANDIDATE_IZTRO'),
    p('thien-duc','Thiên Đức',9+z,'CANDIDATE_IZTRO'),p('nguyet-duc','Nguyệt Đức',5+z,'CANDIDATE_IZTRO'),p('thien-khong','Thiên Không',z+1,'VERIFIED_TUVIVN'),
    p('thien-tai','Thiên Tài',menhBranch+z,'CANDIDATE_IZTRO'),p('thien-tho','Thiên Thọ',thanBranch+z,'CANDIDATE_IZTRO'),
    p('co-than','Cô Thần',coQua.c,'VERIFIED_TUVIVN'),p('qua-tu','Quả Tú',coQua.q,'VERIFIED_TUVIVN')];
}
// Cặp Thiên Khôi/Thiên Việt theo quy ước đang khớp ảnh Tuvi.vn.
// Thứ tự cặp: [Thiên Khôi, Thiên Việt]. Các Can chưa có ảnh (Đinh, Mậu, Nhâm)
// được nội suy theo nhóm Can cùng cặp; vẫn để CANDIDATE_SPEC cho tới khi có fixture.
export const KHOI_VIET_TUVIVN_TABLE:Array<[number,number]>=[
  [1,7], // Giáp: Sửu, Mùi
  [0,8], // Ất: Tý, Thân
  [11,9], // Bính: Hợi, Dậu
  [11,9], // Đinh: Hợi, Dậu (ứng viên cùng nhóm Bính)
  [1,7], // Mậu: Sửu, Mùi (ứng viên cùng nhóm Giáp)
  [0,8], // Kỷ: Tý, Thân
  [6,2], // Canh: Ngọ, Dần
  [6,2], // Tân: Ngọ, Dần
  [3,5], // Nhâm: Mão, Tỵ (ứng viên cùng nhóm Quý)
  [3,5], // Quý: Mão, Tỵ
];
export const KHOI_VIET_TUVIVN_OBSERVED = new Set([0,1,2,5,6,7,9]);
// Quốc Ấn = Lộc Tồn + 8 (Giáp Tuất, Ất Hợi, Bính Sửu, Đinh Dần, Mậu Sửu, Kỷ Dần, Canh Thìn, Tân Tỵ, Nhâm Mùi, Quý Thân).
const QUOC_AN=[10,11,1,2,1,2,4,5,7,8];
const QUOC_AN_VERIFIED_STEMS=new Set([0,1,2,5,6,7,9]);
// Thiên Trù theo Can năm. Quý = Tuất (Tuvi.vn, TV-002 và LEAP-04), KHÔNG phải Hợi như iztro.
const THIEN_TRU=[5,6,0,5,6,8,2,6,9,10];
const THIEN_TRU_VERIFIED_STEMS=new Set([0,1,2,5,6,7,9]);
const unverifiedNote='Chưa có fixture cho Can năm này; dùng bảng nhóm.';
export function placeYearStemStars(yearStem:number):StarPlacement[] {
  const quan=[7,4,5,2,3,9,11,9,10,6];
  const phuc=[9,8,0,11,3,2,6,5,6,5];
  const luuHa=[9,10,7,4,5,6,8,3,11,2];
  const locTon=[2,3,5,6,5,6,8,9,11,0];
  const st=mod(yearStem,10);
  const stat=(set:Set<number>):StarPlacement['status']=>set.has(st)?'VERIFIED_TUVIVN':'CANDIDATE_SPEC';
  const kv=(id:string,name:string,i:0|1):StarPlacement=>{
    const verified=KHOI_VIET_TUVIVN_OBSERVED.has(st);
    const star=p(id,name,KHOI_VIET_TUVIVN_TABLE[st]![i],verified?'VERIFIED_TUVIVN':'CANDIDATE_SPEC');
    return verified?star:{...star,note:'Vị trí nội suy theo nhóm Can trong bảng Tuvi.vn; chưa có ảnh fixture cho Can này.'};
  };
  const withNote=(star:StarPlacement,set:Set<number>):StarPlacement=>set.has(st)?star:{...star,note:unverifiedNote};
  const loc=locTon[st]!;
  return [p('loc-ton','Lộc Tồn',loc,'CANDIDATE_SPEC'),
    p('kinh-duong','Kình Dương',loc+1,'CANDIDATE_SPEC'),
    p('da-la','Đà La',loc-1,'CANDIDATE_SPEC'),
    p('thien-quan','Thiên Quan',quan[st]!,'CANDIDATE_SPEC'),p('thien-phuc','Thiên Phúc',phuc[st]!,'CANDIDATE_SPEC'),
    withNote(p('thien-tru','Thiên Trù',THIEN_TRU[st]!,stat(THIEN_TRU_VERIFIED_STEMS)),THIEN_TRU_VERIFIED_STEMS),
    p('luu-ha','Lưu Hà',luuHa[st]!,'CANDIDATE_SPEC'),
    kv('thien-khoi','Thiên Khôi',0),kv('thien-viet','Thiên Việt',1),
    withNote(p('quoc-an','Quốc Ấn',QUOC_AN[st]!,stat(QUOC_AN_VERIFIED_STEMS)),QUOC_AN_VERIFIED_STEMS)];
}
// Thiên Thương / Thiên Sứ: cố định Nô Bộc (Mệnh+5) và Tật Ách (Mệnh+7), KHÔNG đổi chỗ theo âm dương/giới tính.
// Đã khớp đủ 4 tổ hợp: Dương Nam (TV-001), Âm Nam (TV-002), Âm Nữ (TV-004), Dương Nữ (TV-005).
export function placeThuongSu(menhBranch:number):StarPlacement[] {
  return [p('thien-thuong','Thiên Thương',menhBranch+5,'VERIFIED_TUVIVN'),p('thien-su','Thiên Sứ',menhBranch+7,'VERIFIED_TUVIVN')];
}
// Đẩu Quân: từ Thái Tuế (chi năm) đếm nghịch tới tháng sinh, rồi đếm thuận tới giờ sinh.
// Tháng nhuận dùng nguyên số tháng âm (LEAP-04 ngày 16 không nhảy sang tháng sau).
export function placeDauQuan(yearBranch:number,month:number,hourBranch:number):StarPlacement[] {
  return [p('dau-quan','Đẩu Quân',yearBranch-(month-1)+hourBranch,'VERIFIED_TUVIVN')];
}

const BAC_SI_NAMES=['Bác Sĩ','Lực Sĩ','Thanh Long','Tiểu Hao','Tướng Quân','Tấu Thư','Phi Liêm','Hỷ Thần','Bệnh Phù','Đại Hao','Phục Binh','Quan Phủ'];
const TRANG_SINH_NAMES=['Tràng Sinh','Mộc Dục','Quan Đới','Lâm Quan','Đế Vượng','Suy','Bệnh','Tử','Mộ','Tuyệt','Thai','Dưỡng'];
const THAI_TUE_NAMES=['Thái Tuế','Thiếu Dương','Tang Môn','Thiếu Âm','Quan Phù','Tử Phù','Tuế Phá','Long Đức','Bạch Hổ','Phúc Đức','Điếu Khách','Trực Phù'];
const TRANG_SINH_START:Record<number,number>={2:8,3:11,4:5,5:8,6:2};
export function placeBacSiCircle(locTonBranch:number,direction:1|-1):StarPlacement[] {
  return BAC_SI_NAMES.map((name,i)=>p(`bac-si-${i}`,name,locTonBranch+direction*i,'CANDIDATE_SPEC'));
}
export function placeTrangSinhCircle(bureauNumber:number,direction:1|-1):StarPlacement[] {
  const start=TRANG_SINH_START[bureauNumber];
  if(start===undefined) throw new Error(`Cục không hợp lệ: ${bureauNumber}`);
  return TRANG_SINH_NAMES.map((name,i)=>p(`trang-sinh-${i}`,name,start+direction*i,'CANDIDATE_SPEC'));
}
export function placeThaiTueCircle(yearBranch:number):StarPlacement[] {
  return THAI_TUE_NAMES.map((name,i)=>p(`thai-tue-${i}`,name,yearBranch+i,'CANDIDATE_SPEC'));
}
export function placeHoaLinh(yearBranch:number,hourBranch:number):StarPlacement[] {
  const group=Math.floor(yearBranch/3);
  const hoaStart=[1,2,3,9][group]!;
  const linhStart=[3,10,10,10][group]!;
  // Both directions follow the candidate formula in v1.3; unresolved against Tuvi.vn.
  return [p('hoa-tinh','Hỏa Tinh',hoaStart+hourBranch,'CONFLICT'),p('linh-tinh','Linh Tinh',linhStart+hourBranch,'CONFLICT')];
}
