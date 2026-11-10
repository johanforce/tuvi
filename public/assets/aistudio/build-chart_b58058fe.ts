import { solarToLunar } from '../calendar/vietnamese-lunar.js';
import { julianDayNumber } from '../calendar/julian.js';
import { dayCanChi, hourCanChi, monthCanChi, yearCanChi } from '../calendar/can-chi.js';
import { hourBranchFromTime } from '../calendar/time.js';
import { mod } from './constants.js';
import type { BirthInput, ChartCore, StarPlacement } from './types.js';
import { getMenhThanBranches, getPalaceNames, getPalaceStems } from './palaces.js';
import { getBureau } from './bureau.js';
import { getMenhChu, getThanChu } from './masters.js';
import { getThienPhuBranch, getTuViBranch, place14MainStars } from './main-stars.js';
import { placeBacSiCircle, placeDayStars, placeHoaLinh, placeHourStars, placeMonthStars, placeThaiTueCircle, placeTrangSinhCircle, placeThuongSu, placeDauQuan, placeYearBranchStars, placeYearStemStars } from './stars-secondary.js';
import { placeAnnualTransformations, placeBirthTransformations } from '../catalog/transformations.js';
import { placeAnnualStars } from './stars-annual.js';
import { getGreatFortuneInfo, getLuuNienPalaceNames, getMonthLimitBranches, getTieuHanBranch } from './fortune.js';

function parseDate(value:string):{day:number;month:number;year:number} {
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if(!m) throw new Error('solarDate phải có định dạng YYYY-MM-DD');
  const year=Number(m[1]),month=Number(m[2]),day=Number(m[3]);
  const d=new Date(Date.UTC(year,month-1,day));
  if(d.getUTCFullYear()!==year||d.getUTCMonth()!==month-1||d.getUTCDate()!==day) throw new Error('Ngày dương lịch không hợp lệ');
  if(year<1900||year>2100) throw new RangeError('MVP hỗ trợ năm sinh 1900–2100');
  return {day,month,year};
}
export function getPlacementMonth(month:number,_day:number,isLeap:boolean):number {
  // tuvicohoc.ai.studio keeps the displayed lunar month for the entire leap month.
  // Reference screenshots LEAP-03/04 (15th/16th of leap month 2, 2023)
  // and LEAP-08/09 (15th/16th of leap month 6, 2025) keep the same
  // month Can-Chi, Mệnh/Thân and bureau across the 15/16 boundary.
  // Do not roll the placement month forward on day 16.
  return month;
}
function addToPalaces(stars:StarPlacement[],palaceStars:Map<number,StarPlacement[]>):void {
  for(const star of stars){ const list=palaceStars.get(star.branch)??[]; list.push(star); palaceStars.set(star.branch,list); }
}
export function buildChart(input:BirthInput):ChartCore {
  if(input.gender!=='nam'&&input.gender!=='nu') throw new Error('Giới tính bắt buộc là Nam hoặc Nữ');
  const solar=parseDate(input.solarDate);
  const lunar=solarToLunar(solar.day,solar.month,solar.year,7);
  const pMonth=getPlacementMonth(lunar.month,lunar.day,lunar.isLeapMonth);
  const jdn=julianDayNumber(solar.day,solar.month,solar.year);
  const ycc=yearCanChi(lunar.year), mcc=monthCanChi(ycc.stem,pMonth), dcc=dayCanChi(jdn);
  const unknown=input.unknownTime===true || input.hour===undefined || input.minute===undefined;
  const timeBranch=unknown?undefined:hourBranchFromTime(input.hour!,input.minute!);
  // tuvicohoc.ai.studio's late-Zi convention: for 23:00–23:59, the hour pillar uses
  // the following day's stem, while the displayed day pillar remains the
  // solar date's stem. Early-Zi (00:00–00:59) uses the current date.
  const hourStem=timeBranch===0 && input.hour===23 ? dayCanChi(jdn+1).stem : dcc.stem;
  const hcc=timeBranch===undefined?undefined:hourCanChi(hourStem,timeBranch);
  const viewedYear=input.viewedYear??solar.year;
  if(!Number.isInteger(viewedYear)||viewedYear<1900||viewedYear>2100) throw new RangeError('Năm xem phải là số nguyên trong khoảng 1900–2100');
  const age=viewedYear-lunar.year+1;
  if(age<1) throw new RangeError('Năm xem không thể trước năm sinh âm lịch.');
  const annualData=placeAnnualStars(viewedYear,ycc.stem);
  const tieuHanBranch=getTieuHanBranch(ycc.branch,age,input.gender);
  const warnings:string[]=[];
  warnings.push(`Sao lưu đang hiển thị theo năm ${viewedYear} (${annualData.yearCanChi.label}); các công thức/bảng an đang ở trạng thái ứng viên, chưa xác minh đầy đủ với tuvicohoc.ai.studio.`);
  if(annualData.pending.length) warnings.push(`Chưa an được ${annualData.pending.length} sao lưu do thiếu quy tắc đủ căn cứ: ${annualData.pending.map(s=>s.name).join(', ')}.`);
  if(lunar.isLeapMonth) warnings.push(`Sinh tháng nhuận ${lunar.month}; theo các fixture tuvicohoc.ai.studio LEAP-03/04 và LEAP-08/09, engine giữ nguyên tháng âm nhuận cho Can Chi tháng, Mệnh/Thân và an sao trong toàn bộ tháng nhuận.`);
  if(unknown) warnings.push('Không rõ giờ sinh: chưa an Mệnh/Thân, chính tinh và các sao phụ thuộc giờ. Không tự gán giờ mặc định.');
  const palaceStars=new Map<number,StarPlacement[]>();
  let menh:number|undefined,than:number|undefined,bureau:ChartCore['bureau'],tv:number|undefined,tp:number|undefined;
  const natalStarBranches=new Map<string,number>();
  if(timeBranch!==undefined){
    ({menh,than}=getMenhThanBranches(pMonth,timeBranch));
    const palaceStems=getPalaceStems(ycc.stem,menh);
    const menhStem=palaceStems[menh]!;
    const b=getBureau(menhStem,menh); bureau={number:b.number,name:b.name};
    tv=getTuViBranch(lunar.day,b.number); tp=getThienPhuBranch(tv);
    addToPalaces(place14MainStars(tv,tp).map(s=>({...s,scope:'natal' as const,status:'CANDIDATE_SPEC' as const})),palaceStars);
    const monthStars=placeMonthStars(pMonth); addToPalaces(monthStars,palaceStars);
    const hourStars=placeHourStars(timeBranch); addToPalaces(hourStars,palaceStars);
    const ta=monthStars.find(s=>s.id==='ta-phu')!.branch,huu=monthStars.find(s=>s.id==='huu-bat')!.branch;
    const vx=hourStars.find(s=>s.id==='van-xuong')!.branch,vk=hourStars.find(s=>s.id==='van-khuc')!.branch;
    addToPalaces(placeDayStars(lunar.day,ta,huu,vx,vk),palaceStars);
    addToPalaces(placeYearBranchStars(ycc.branch,menh,than),palaceStars);
    addToPalaces(placeThuongSu(menh),palaceStars);
    addToPalaces(placeDauQuan(ycc.branch,pMonth,timeBranch),palaceStars);
    const stemStars=placeYearStemStars(ycc.stem); addToPalaces(stemStars,palaceStars);
    const locTon=stemStars.find(s=>s.id==='loc-ton')!.branch;
    const yangYear=ycc.stem%2===0;
    const direction:1|-1=((yangYear&&input.gender==='nam')||(!yangYear&&input.gender==='nu'))?1:-1;
    addToPalaces(placeBacSiCircle(locTon,direction),palaceStars);
    addToPalaces(placeTrangSinhCircle(b.number,direction),palaceStars);
    addToPalaces(placeThaiTueCircle(ycc.branch),palaceStars);
    addToPalaces(placeHoaLinh(ycc.branch,timeBranch),palaceStars);
    for (const [branch,items] of palaceStars) for (const item of items) if(item.scope==='natal') natalStarBranches.set(item.id,branch);
    const transformations=placeBirthTransformations(ycc.stem,natalStarBranches);
    addToPalaces(transformations,palaceStars);
  }
  addToPalaces(annualData.stars,palaceStars);
  if(timeBranch!==undefined){
    addToPalaces(placeAnnualTransformations(annualData.yearCanChi.stem,natalStarBranches),palaceStars);
  }
  const names=menh===undefined?Array.from({length:12},(_,branch)=>({branch,name:'Chưa xác định'})):getPalaceNames(menh);
  const stems=getPalaceStems(ycc.stem,menh??2);
  const palaces=names.map(({branch,name})=>({branch,name,stem:stems[branch]!,stars:palaceStars.get(branch)??[]}));
  const yangYear=ycc.stem%2===0;
  const fortuneDirection:1|-1=((yangYear&&input.gender==='nam')||(!yangYear&&input.gender==='nu'))?1:-1;
  const greatFortune=menh===undefined||bureau===undefined?undefined:getGreatFortuneInfo(menh,bureau.number,age,fortuneDirection);
  const luuNienPalaces=greatFortune?getLuuNienPalaceNames(greatFortune.luuNienMenhBranch):undefined;
  const monthLimitPalaces=timeBranch===undefined?undefined:getMonthLimitBranches(tieuHanBranch,pMonth,timeBranch);
  if(timeBranch===undefined) warnings.push('Không rõ giờ sinh: có thể an Tiểu Hạn theo tuổi, nhưng chưa thể định vị Th.1–Th.12 vì Nguyệt hạn cần giờ sinh.');
  if(menh!==undefined && bureau!==undefined && age < bureau.number) warnings.push(`Tuổi mụ ${age} chưa tới tuổi khởi Đại Hạn của Cục (${bureau.number}); chưa gán nhãn LN.*.`);
  return {input,age,tieuHanBranch,...(monthLimitPalaces?{monthLimitPalaces}:{}),...(greatFortune?{greatFortune}:{}),...(luuNienPalaces?{luuNienPalaces}:{}),lunar:{...lunar,placementMonth:pMonth},yearCanChi:ycc,monthCanChi:mcc,dayCanChi:dcc,viewedYear,viewedYearCanChi:annualData.yearCanChi,annualPendingStars:annualData.pending,...(hcc?{hourCanChi:hcc}:{}),...(timeBranch===undefined?{}:{timeBranch}),...(menh===undefined?{}:{menhBranch:menh}),...(than===undefined?{}:{thanBranch:than}),menhChu:getMenhChu(ycc.branch),thanChu:getThanChu(ycc.branch),...(bureau?{bureau}:{}),...(tv===undefined?{}:{tuViBranch:tv}),...(tp===undefined?{}:{thienPhuBranch:tp}),palaces,warnings};
}
