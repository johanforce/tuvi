import { mod, PALACE_NAMES } from './constants.js';
export function getMenhThanBranches(placementMonth:number,timeBranch:number):{menh:number;than:number} {
  return {menh:mod(2+(placementMonth-1)-timeBranch),than:mod(2+(placementMonth-1)+timeBranch)};
}
export function getPalaceNames(menhBranch:number):Array<{branch:number;name:string}> {
  return Array.from({length:12},(_,offset)=>({branch:mod(menhBranch+offset),name:PALACE_NAMES[offset]!}));
}
export function getPalaceStems(yearStem:number,menhBranch:number):number[] {
  const tigerStemByYearStem=[2,4,6,8,0,2,4,6,8,0]; // Bính, Mậu, Canh, Nhâm, Giáp...
  const tigerStem=tigerStemByYearStem[mod(yearStem,10)]!;
  // Palace stems follow the forward 12-branch ring from Dần.
  // Normalize the branch offset in modulo 12 BEFORE applying the 10-stem cycle;
  // raw (branch - 2) incorrectly treats Tý/Sửu as -2/-1 and shifts them by 2 Can.
  return Array.from({length:12},(_,branch)=>mod(tigerStem+mod(branch-2,12),10));
}
