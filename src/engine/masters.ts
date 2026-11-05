import { mod } from './constants.js';
const MENH_CHU=['Tham Lang','Cự Môn','Lộc Tồn','Văn Khúc','Liêm Trinh','Vũ Khúc','Phá Quân','Vũ Khúc','Liêm Trinh','Văn Khúc','Lộc Tồn','Cự Môn'];
const THAN_CHU=['Linh Tinh','Thiên Tướng','Thiên Lương','Thiên Đồng','Văn Xương','Thiên Cơ','Hỏa Tinh','Thiên Tướng','Thiên Lương','Thiên Đồng','Văn Xương','Thiên Cơ'];
export function getMenhChu(birthYearBranch:number):string { return MENH_CHU[mod(birthYearBranch)]!; }
export function getThanChu(birthYearBranch:number):string { return THAN_CHU[mod(birthYearBranch)]!; }
