import { mod } from '../engine/constants.js';
import { julianDayNumber } from './julian.js';
export interface CanChi { stem:number; branch:number; stemName:string; branchName:string; label:string; }
import { stemName, branchName } from '../engine/constants.js';
export function makeCanChi(stem:number,branch:number):CanChi {
  const s=mod(stem,10), b=mod(branch,12);
  return {stem:s,branch:b,stemName:stemName(s),branchName:branchName(b),label:`${stemName(s)} ${branchName(b)}`};
}
export function yearCanChi(lunarYear:number):CanChi { return makeCanChi(lunarYear+6,lunarYear+8); }
export function monthCanChi(yearStem:number,placementMonth:number):CanChi {
  // Công thức Can tháng đã được người dùng xác nhận.
  const stem=mod(2*yearStem+placementMonth+1,10);
  const branch=mod(placementMonth+1,12);
  return makeCanChi(stem,branch);
}
export function dayCanChi(jdn:number):CanChi { return makeCanChi(jdn+9,jdn+1); }
export function hourCanChi(dayStem:number,hourBranch:number):CanChi { return makeCanChi(2*dayStem+hourBranch,hourBranch); }
export function solarDayCanChi(day:number,month:number,year:number):CanChi { return dayCanChi(julianDayNumber(day,month,year)); }
