import type { Gender } from './constants.js';
export type VerificationStatus='USER_VERIFIED'|'MISSING_RULE'|'UNKNOWN_TIME';
export interface BirthInput { name?:string; gender:Gender; solarDate:string; hour?:number; minute?:number; unknownTime?:boolean; viewedYear?:number; }
export interface AnnualPendingStar { id:string; name:string; status:'MISSING_RULE'; note:string; }
export interface LunarInfo { day:number; month:number; year:number; isLeapMonth:boolean; placementMonth:number; }
export interface StarPlacement { id:string; name:string; branch:number; scope:'natal'|'annual'; status:VerificationStatus; note?:string; }
export interface Palace { branch:number; name:string; stem:number; stars:StarPlacement[]; }
export interface MonthLimitLabel { branch:number; month:number; label:string; }
export interface GreatFortuneInfo { direction:1|-1; decadeIndex:number; startAge:number; endAge:number; yearInDecade:number; branch:number; luuNienMenhBranch:number; }
export interface LuuNienPalaceLabel { branch:number; name:string; }
export interface ChartCore {
  age:number; tieuHanBranch:number; monthLimitPalaces?:MonthLimitLabel[]; greatFortune?:GreatFortuneInfo; luuNienPalaces?:LuuNienPalaceLabel[];
  input:BirthInput; lunar:LunarInfo; yearCanChi:{stem:number;branch:number;label:string}; monthCanChi:{stem:number;branch:number;label:string}; dayCanChi:{stem:number;branch:number;label:string}; hourCanChi?:{stem:number;branch:number;label:string};
  viewedYear:number; viewedYearCanChi:{stem:number;branch:number;label:string}; annualPendingStars:AnnualPendingStar[];
  timeBranch?:number; menhBranch?:number; thanBranch?:number; menhChu?:string; thanChu?:string; bureau?:{number:2|3|4|5|6;name:string}; tuViBranch?:number; thienPhuBranch?:number; palaces:Palace[]; warnings:string[];
}
