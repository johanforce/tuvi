import { julianDayNumber } from './julian.js';

// Ho Ngoc Duc / Vietnamese lunar calendar algorithm, fixed UTC+7.
// Keep timezone fixed by product decision; do not add location/longitude correction here.
const PI = Math.PI;
function newMoon(k:number):number {
  const T=k/1236.85, T2=T*T, T3=T2*T, dr=PI/180;
  let jd=2415020.75933+29.53058868*k+0.0001178*T2-0.000000155*T3;
  jd += 0.00033*Math.sin((166.56+132.87*T-0.009173*T2)*dr);
  const M=359.2242+29.10535608*k-0.0000333*T2-0.00000347*T3;
  const Mpr=306.0253+385.81691806*k+0.0107306*T2+0.00001236*T3;
  const F=21.2964+390.67050646*k-0.0016528*T2-0.00000239*T3;
  let C=(0.1734-0.000393*T)*Math.sin(M*dr)+0.0021*Math.sin(2*M*dr);
  // Keep the signed periodic terms explicit. Grouping them under `-=` had
  // inverted several small corrections and shifted new-moon civil-day edges.
  C+=-0.4068*Math.sin(Mpr*dr)+0.0161*Math.sin(2*Mpr*dr);
  C-=0.0004*Math.sin(3*Mpr*dr);
  C+=0.0104*Math.sin(2*F*dr)-0.0051*Math.sin((M+Mpr)*dr);
  C+=-0.0074*Math.sin((M-Mpr)*dr)+0.0004*Math.sin((2*F+M)*dr);
  C+=-0.0004*Math.sin((2*F-M)*dr)-0.0006*Math.sin((2*F+Mpr)*dr);
  C+=0.0010*Math.sin((2*F-Mpr)*dr)+0.0005*Math.sin((2*Mpr+M)*dr);
  const deltaT = T < -11 ? 0.001 + 0.000839*T + 0.0002261*T2 - 0.00000845*T3 - 0.000000081*T*T3 : -0.000278 + 0.000265*T + 0.000262*T2;
  return jd+C-deltaT;
}
function sunLongitude(jdn:number):number {
  const T=(jdn-2451545.0)/36525, T2=T*T, dr=PI/180;
  const M=357.52910+35999.05030*T-0.0001559*T2-0.00000048*T*T2;
  const L0=280.46645+36000.76983*T+0.0003032*T2;
  let DL=(1.914600-0.004817*T-0.000014*T2)*Math.sin(dr*M);
  DL+=(0.019993-0.000101*T)*Math.sin(2*dr*M)+0.000290*Math.sin(3*dr*M);
  let L=(L0+DL)*dr; L-=PI*2*Math.floor(L/(PI*2));
  return L;
}
function getNewMoonDay(k:number, tz=7):number { return Math.floor(newMoon(k)+0.5+tz/24); }
function getSunLongitudeSector(dayNumber:number,tz=7):number { return Math.floor(sunLongitude(dayNumber-0.5-tz/24)/PI*6); }
function getLunarMonth11(year:number,tz=7):number {
  const off=julianDayNumber(31,12,year)-2415021;
  const k=Math.floor(off/29.530588853);
  let nm=getNewMoonDay(k,tz);
  if(getSunLongitudeSector(nm,tz)>=9) nm=getNewMoonDay(k-1,tz);
  return nm;
}
function getLeapMonthOffset(a11:number,tz=7):number {
  const k=Math.floor(0.5+(a11-2415021.076998695)/29.530588853);
  let last=0, i=1, arc=getSunLongitudeSector(getNewMoonDay(k+i,tz),tz);
  do { last=arc; i++; arc=getSunLongitudeSector(getNewMoonDay(k+i,tz),tz); } while(arc!==last && i<14);
  return i-1;
}
export interface LunarDate { day:number; month:number; year:number; isLeapMonth:boolean; }
export function solarToLunar(day:number,month:number,year:number,tz=7):LunarDate {
  const dayNumber=julianDayNumber(day,month,year);
  const k=Math.floor((dayNumber-2415021.076998695)/29.530588853);
  let monthStart=getNewMoonDay(k+1,tz);
  if(monthStart>dayNumber) monthStart=getNewMoonDay(k,tz);
  let a11=getLunarMonth11(year,tz), b11=a11;
  let lunarYear:number;
  if(a11>=monthStart){ lunarYear=year; a11=getLunarMonth11(year-1,tz); }
  else { lunarYear=year+1; b11=getLunarMonth11(year+1,tz); }
  const lunarDay=dayNumber-monthStart+1;
  const diff=Math.floor((monthStart-a11)/29);
  let lunarLeap=false;
  let lunarMonth=diff+11;
  if(b11-a11>365){
    const leapDiff=getLeapMonthOffset(a11,tz);
    if(diff>=leapDiff){ lunarMonth=diff+10; if(diff===leapDiff) lunarLeap=true; }
  }
  if(lunarMonth>12) lunarMonth-=12;
  if(lunarMonth>=11 && diff<4) lunarYear--;
  return {day:lunarDay,month:lunarMonth,year:lunarYear,isLeapMonth:lunarLeap};
}
