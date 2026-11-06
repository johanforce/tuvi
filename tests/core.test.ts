import {describe,it,expect} from 'vitest';
import fixtures from './fixtures/tuvi-vn-fixtures.json';
import capturedFixtures from './fixtures/tuvi-vn-captured-20261105.json';
import secondaryStars from './fixtures/tuvi-vn-secondary-stars.json';
import {hourBranchFromTime} from '../src/calendar/time.js';
import {solarToLunar} from '../src/calendar/vietnamese-lunar.js';
import {julianDayNumber} from '../src/calendar/julian.js';
import {dayCanChi,monthCanChi,yearCanChi,hourCanChi} from '../src/calendar/can-chi.js';
import {getMenhThanBranches,getPalaceStems} from '../src/engine/palaces.js';
import {getTuViBranch,getThienPhuBranch,place14MainStars} from '../src/engine/main-stars.js';
import {placeYearStemStars, KHOI_VIET_TUVIVN_OBSERVED,placeHourStars,placeMonthStars,placeYearBranchStars} from '../src/engine/stars-secondary.js';
import {getTieuHanBranch,getMonthLimitBranches,getGreatFortuneInfo,getLuuNienPalaceNames} from '../src/engine/fortune.js';
import {placeAnnualStars} from '../src/engine/stars-annual.js';
import {placeAnnualTransformations} from '../src/catalog/transformations.js';
import {buildChart,getPlacementMonth} from '../src/engine/build-chart.js';
import {EARTHLY_BRANCHES,HEAVENLY_STEMS,mod} from '../src/engine/constants.js';
import {STAR_META} from '../src/catalog/star-metadata.js';
import {getStarBrightness} from '../src/data/brightness.js';

const captureAudit = capturedFixtures as Array<{id:string;inputAuditStatus?:string;duplicateOf?:string;sourceObservationNote?:string;ruleNote?:string}>;
const MAIN_IDS=['tu-vi','thien-co','thai-duong','vu-khuc','thien-dong','liem-trinh','thien-phu','thai-am','tham-lang','cu-mon','thien-tuong','thien-luong','that-sat','pha-quan'];
const tigerStemByYearStem=[2,4,6,8,0,2,4,6,8,0];
const parseTime=(value:string)=>value.split(':').map(Number) as [number,number];

 describe('giờ địa chi theo quy ước 12 canh giờ',()=>{
  it.each([
    [0,30,0],[1,30,1],[3,30,2],[5,30,3],[7,30,4],[9,30,5],
    [11,30,6],[13,30,7],[15,30,8],[17,30,9],[19,30,10],[21,30,11],
    [23,0,0],[0,59,0],[1,0,1],[2,59,1],[22,59,11],[23,59,0]
  ] as const)('%i:%i => chi %i',(h,m,b)=>expect(hourBranchFromTime(h,m)).toBe(b));
 });

describe('lịch âm Việt Nam UTC+7',()=>{
  it.each(fixtures.map(f=>[f.id,f.input.solarDate,f.expected.lunar] as const))('%s calendar fixture %s',(id,date,expected)=>{
    const [year,month,day]=date.split('-').map(Number);
    expect(solarToLunar(day!,month!,year!,7)).toEqual(expected);
  });
  it('Tết 2024',()=>expect(solarToLunar(10,2,2024,7)).toEqual({day:1,month:1,year:2024,isLeapMonth:false}));
  it('đầu, giữa và ngày 16 tháng 2 nhuận 2023',()=>{
    expect(solarToLunar(22,3,2023,7)).toEqual({day:1,month:2,year:2023,isLeapMonth:true});
    expect(solarToLunar(5,4,2023,7)).toEqual({day:15,month:2,year:2023,isLeapMonth:true});
    expect(solarToLunar(6,4,2023,7)).toEqual({day:16,month:2,year:2023,isLeapMonth:true});
  });
  it('đầu, giữa và ngày 16 tháng 6 nhuận 2025',()=>{
    expect(solarToLunar(25,7,2025,7)).toEqual({day:1,month:6,year:2025,isLeapMonth:true});
    expect(solarToLunar(8,8,2025,7)).toEqual({day:15,month:6,year:2025,isLeapMonth:true});
    expect(solarToLunar(9,8,2025,7)).toEqual({day:16,month:6,year:2025,isLeapMonth:true});
  });
  it('tuvidauso.ai.studio giữ nguyên tháng âm trong toàn bộ tháng nhuận, kể cả ngày 16 và ngày cuối',()=>{
    for (const day of [1,15,16,29,30]) {
      expect(getPlacementMonth(2,day,true)).toBe(2);
      expect(getPlacementMonth(6,day,true)).toBe(6);
    }
    expect(getPlacementMonth(12,30,true)).toBe(12);
    expect(getPlacementMonth(6,16,false)).toBe(6);
  });
});

describe('28 testcase fixture tuvidauso.ai.studio thu thập ngày 05/11/2026',()=>{
  it.each(capturedFixtures.map(f=>[f.id,f] as const))('%s: lịch âm, Can Chi và Cục khớp ảnh trung tâm',(id,f)=>{
    const [hour,minute]=parseTime(f.input.time);
    const chart=buildChart({solarDate:f.input.solarDate,gender:f.input.gender as 'nam'|'nu',hour,minute});
    expect({day:chart.lunar.day,month:chart.lunar.month,year:chart.lunar.year,isLeapMonth:chart.lunar.isLeapMonth}).toEqual(f.expectedFromTuviVn.lunar);
    expect(chart.yearCanChi.label).toBe(f.expectedFromTuviVn.yearCanChi);
    expect(chart.monthCanChi.label).toBe(f.expectedFromTuviVn.monthCanChi);
    expect(chart.dayCanChi.label).toBe(f.expectedFromTuviVn.dayCanChi);
    expect(chart.hourCanChi?.label).toBe(f.expectedFromTuviVn.hourCanChi);
    expect(EARTHLY_BRANCHES[chart.timeBranch!]).toBe(f.expectedFromTuviVn.timeBranch);
    expect(chart.bureau?.name).toBe(f.expectedFromTuviVn.bureau);
    if (f.expectedFromTuviVn.menhBranch) expect(EARTHLY_BRANCHES[chart.menhBranch!]).toBe(f.expectedFromTuviVn.menhBranch);
    if (f.expectedFromTuviVn.thanBranch) expect(EARTHLY_BRANCHES[chart.thanBranch!]).toBe(f.expectedFromTuviVn.thanBranch);
    if (f.expectedFromTuviVn.mainStars) {
      const actual:Record<string,string>={};
      for (const palace of chart.palaces) for (const star of palace.stars) if (MAIN_IDS.includes(star.id)) actual[star.id]=EARTHLY_BRANCHES[palace.branch]!;
      expect(actual).toEqual(f.expectedFromTuviVn.mainStars);
    }
  });
  it('không còn ảnh capture lệch input so với testcase dự kiến',()=>{
    const flagged=captureAudit.filter(f=>f.inputAuditStatus==='MISMATCH_TO_PLANNED_TESTCASE_ACTUAL_SCREENSHOT_INPUT_RECORDED');
    expect(flagged.map(f=>f.id)).toEqual([]);
  });
  it('không tính ảnh chụp trùng thành fixture độc lập',()=>{
    const duplicates=captureAudit.filter(f=>Boolean(f.duplicateOf));
    expect(duplicates.map(f=>[f.id,f.duplicateOf])).toEqual([]);
  });
  it('bốn testcase được chụp lại đều khớp input và có đủ 14 chính tinh',()=>{
    const expectedInputs={
      'CORE-02':{solarDate:'1990-01-01',time:'10:30',gender:'nam',viewedYear:2030},
      'CORE-03':{solarDate:'1990-01-01',time:'16:30',gender:'nam',viewedYear:2030},
      'CAL-03':{solarDate:'2024-03-09',time:'12:30',gender:'nu',viewedYear:2030},
      'CAL-04':{solarDate:'2024-03-10',time:'12:30',gender:'nu',viewedYear:2030}
    };
    for (const [id,input] of Object.entries(expectedInputs)) {
      const f=capturedFixtures.find(x=>x.id===id)!;
      expect(f.input).toMatchObject(input);
      expect(f.inputAuditStatus).toBe('MATCHES_PLANNED_TESTCASE');
      expect(f.expectedFromTuviVn.mainStars).toBeDefined();
      expect(Object.keys(f.expectedFromTuviVn.mainStars!)).toHaveLength(14);
    }
    const c1=capturedFixtures.find(f=>f.id==='CORE-01')!;
    const c5=capturedFixtures.find(f=>f.id==='CORE-05')!;
    expect(c1.inputAuditStatus).toBe('MATCHES_PLANNED_TESTCASE');
    expect(c5.inputAuditStatus).toBe('MATCHES_PLANNED_TESTCASE');
    expect(c5.input).toMatchObject({solarDate:'1990-01-02',time:'08:30',gender:'nam',viewedYear:2030});
  });
  it('giữ riêng ghi chú quy tắc tháng nhuận và giờ Tý muộn, không coi là sai đầu vào',()=>{
    expect(captureAudit.find(f=>f.id==='LEAP-04')?.sourceObservationNote).toContain('day 16');
    expect(captureAudit.find(f=>f.id==='LEAP-09')?.sourceObservationNote).toContain('day 16');
    expect(captureAudit.find(f=>f.id==='HOUR-02')?.ruleNote).toContain('23:00');
  });
});

describe('Tiểu Hạn, Nguyệt hạn và Lưu Niên Đại Hạn',()=>{
  it('tái lập bốn fixture tuvidauso.ai.studio: Tiểu Hạn và Th.1 đúng vị trí',()=>{
    const cases=[
      {id:'TV-001',birthChi:10,age:117,gender:'nam' as const,month:12,hour:6,tieuHan:0,month1:7},
      {id:'TV-002',birthChi:1,age:114,gender:'nam' as const,month:5,hour:6,tieuHan:0,month1:2},
      {id:'TV-003',birthChi:3,age:28,gender:'nam' as const,month:11,hour:3,tieuHan:4,month1:9},
      {id:'TV-004',birthChi:3,age:16,gender:'nu' as const,month:6,hour:1,tieuHan:10,month1:6},
    ];
    for(const c of cases){
      const tieuHan=getTieuHanBranch(c.birthChi,c.age,c.gender);
      expect(tieuHan,`${c.id} Tiểu Hạn`).toBe(c.tieuHan);
      expect(getMonthLimitBranches(tieuHan,c.month,c.hour)[0]!.branch,`${c.id} Th.1`).toBe(c.month1);
      const labels=getMonthLimitBranches(tieuHan,c.month,c.hour);
      expect(new Set(labels.map(x=>x.branch)).size).toBe(12);
      expect(labels.map(x=>x.label)).toEqual(Array.from({length:12},(_,i)=>`Th.${i+1}`));
    }
  });
  it('LN.Mệnh theo vị trí Đại Hạn và thứ tự năm trong Đại Hạn, không lấy thẳng Chi năm xem',()=>{
    const cases=[
      {id:'TV-001',menh:7,bureau:3,age:117,direction:1 as const,decadeBranch:6,year:5,lnMenh:1},
      {id:'TV-002',menh:0,bureau:4,age:114,direction:-1 as const,decadeBranch:1,year:1,lnMenh:1},
      {id:'TV-003',menh:9,bureau:4,age:28,direction:-1 as const,decadeBranch:7,year:5,lnMenh:0},
      {id:'TV-004',menh:6,bureau:4,age:16,direction:1 as const,decadeBranch:7,year:3,lnMenh:0},
    ];
    for(const c of cases){
      const actual=getGreatFortuneInfo(c.menh,c.bureau,c.age,c.direction)!;
      expect(actual.branch,`${c.id} Đại Hạn`).toBe(c.decadeBranch);
      expect(actual.yearInDecade,`${c.id} năm trong Đại Hạn`).toBe(c.year);
      expect(actual.luuNienMenhBranch,`${c.id} LN.Mệnh`).toBe(c.lnMenh);
      expect(getLuuNienPalaceNames(actual.luuNienMenhBranch).find(x=>x.name==='LN.MỆNH')!.branch).toBe(c.lnMenh);
    }
  });
  it('thứ tự LN.* đi thuận đủ 12 cung, và tuổi trước tuổi khởi Cục chưa có LN',()=>{
    const labels=getLuuNienPalaceNames(1);
    expect(labels.map(x=>x.name)).toEqual(['LN.PHU','LN.PHÚC','LN.ĐIỀN','LN.QUAN','LN.NÔ','LN.DI','LN.TẬT','LN.TÀI','LN.TỬ','LN.PHỐI','LN.HUYNH','LN.MỆNH']);
    expect(getGreatFortuneInfo(3,4,3,1)).toBeUndefined();
  });
});

describe('Can Chi',()=>{
  it.each(fixtures.map(f=>[f.id,f.input.solarDate,f.expected.yearCanChi,f.expected.monthCanChi,f.expected.dayCanChi,f.expected.hourCanChi,f.input.time] as const))('%s year/month/day/hour',(id,date,year,month,day,hour,time)=>{
    const [y,m,d]=date.split('-').map(Number);
    const lunar=solarToLunar(d!,m!,y!,7);
    const ycc=yearCanChi(lunar.year);
    expect(ycc.label).toBe(year);
    expect(monthCanChi(ycc.stem,getPlacementMonth(lunar.month,lunar.day,lunar.isLeapMonth)).label).toBe(month);
    expect(dayCanChi(julianDayNumber(d!,m!,y!)).label).toBe(day);
    const [h,min]=parseTime(time);
    const branch=hourBranchFromTime(h,min);
    expect(hourCanChi(dayCanChi(julianDayNumber(d!,m!,y!)).stem,branch).label).toBe(hour);
  });
  it('tháng Can Chi theo Ngũ Hổ Độn: đủ 10 Can năm × 12 tháng',()=>{
    for(let yearStem=0;yearStem<10;yearStem++) for(let month=1;month<=12;month++){
      const actual=monthCanChi(yearStem,month);
      expect(actual.stem).toBe(mod(tigerStemByYearStem[yearStem]!+month-1,10));
      expect(actual.branch).toBe(mod(month+1,12));
    }
  });
});

describe('Can cung, Mệnh/Thân và Cục',()=>{
  it('Can cung chạy thuận từ Dần và quay vòng đúng qua Tý/Sửu, đủ 10 Can năm',()=>{
    for(let yearStem=0;yearStem<10;yearStem++){
      const stems=getPalaceStems(yearStem,0);
      expect(stems[2]).toBe(tigerStemByYearStem[yearStem]);
      for(let branch=0;branch<12;branch++){
        expect(stems[branch]).toBe(mod(tigerStemByYearStem[yearStem]!+mod(branch-2,12),10));
      }
    }
    // Quý year: Dần=Giáp, Tý=Giáp, Sửu=Ất (not Nhâm/Quý from raw negative offsets).
    expect(getPalaceStems(9,0).slice(0,3)).toEqual([0,1,0]);
  });
  it.each(fixtures.map(f=>f).filter(f=>f.expected.menhBranch && f.expected.thanBranch))('%s Mệnh/Thân/Cục',f=>{
    const month=getPlacementMonth(f.expected.lunar.month,f.expected.lunar.day,f.expected.lunar.isLeapMonth);
    const hourBranch=EARTHLY_BRANCHES.indexOf(f.expected.timeBranch as typeof EARTHLY_BRANCHES[number]);
    const [actualMenh,actualThan]=(()=>{const x=getMenhThanBranches(month,hourBranch);return [x.menh,x.than] as const;})();
    expect(actualMenh).toBe(EARTHLY_BRANCHES.indexOf(f.expected.menhBranch as typeof EARTHLY_BRANCHES[number]));
    expect(actualThan).toBe(EARTHLY_BRANCHES.indexOf(f.expected.thanBranch as typeof EARTHLY_BRANCHES[number]));
    const [h,min]=parseTime(f.input.time); const c=buildChart({gender:f.input.gender as 'nam'|'nu',solarDate:f.input.solarDate,hour:h,minute:min});
    expect(EARTHLY_BRANCHES[c.menhBranch!]).toBe(f.expected.menhBranch);
    expect(EARTHLY_BRANCHES[c.thanBranch!]).toBe(f.expected.thanBranch);
    if(f.expected.menhPalaceStem) expect(HEAVENLY_STEMS[c.palaces.find(p=>p.branch===c.menhBranch)!.stem]).toBe(f.expected.menhPalaceStem);
    expect(c.bureau?.name).toBe(f.expected.bureau);
  });
});

describe('14 chính tinh',()=>{
  const fullStarFixtures=fixtures.filter(f=>'mainStars' in f.expected);
  const observedStarFixtures=fixtures.filter(f=>'observedMainStars' in f.expected);
  it.each(fullStarFixtures.map(f=>[f.id,f] as const))('%s: đủ 14 sao và đúng chi từng sao trong fixture',(id,f)=>{
    const [hour,minute]=parseTime(f.input.time);
    const chart=buildChart({gender:f.input.gender as 'nam'|'nu',solarDate:f.input.solarDate,hour,minute});
    const actual:Record<string,string>={};
    for(const palace of chart.palaces) for(const star of palace.stars) if(MAIN_IDS.includes(star.id)) actual[star.id]=EARTHLY_BRANCHES[palace.branch]!;
    expect(Object.keys(actual).sort()).toEqual([...MAIN_IDS].sort());
    expect(actual).toEqual(f.expected.mainStars);
  });
  it.each(observedStarFixtures.map(f=>[f.id,f] as const))('%s: so khớp các chính tinh đọc được từ trang công khai',(id,f)=>{
    const [hour,minute]=parseTime(f.input.time);
    const chart=buildChart({gender:f.input.gender as 'nam'|'nu',solarDate:f.input.solarDate,hour,minute});
    const actual:Record<string,string>={};
    for(const palace of chart.palaces) for(const star of palace.stars) if(MAIN_IDS.includes(star.id)) actual[star.id]=EARTHLY_BRANCHES[palace.branch]!;
    for(const [starId,branch] of Object.entries(f.expected.observedMainStars!)) expect(actual[starId]).toBe(branch);
  });
  it('Tử Vi và Thiên Phủ luôn là 2 mốc của 14 chính tinh',()=>{
    const tv=getTuViBranch(2,3),tp=getThienPhuBranch(tv),stars=place14MainStars(tv,tp);
    expect(stars).toHaveLength(14); expect(new Set(stars.map(s=>s.id)).size).toBe(14);
  });
  it('fixture năm xem khác năm sinh là dữ liệu độc lập với ngày sinh',()=>{
    const differentYear=fixtures.filter(f=>f.input.viewedYear!==f.expected.lunar.year);
    expect(differentYear.length).toBeGreaterThanOrEqual(19);
  });
});

describe('P0 coverage matrix',()=>{
  it('có ít nhất 20 lá số tuvidauso.ai.studio duy nhất',()=>{
    expect(fixtures.length).toBeGreaterThanOrEqual(20);
    expect(new Set(fixtures.map(f=>f.id)).size).toBe(fixtures.length);
    expect(new Set(fixtures.map(f=>f.sourceUrl??f.source)).size).toBe(fixtures.length);
  });
  it('mọi fixture có nguồn truy vết và có năm xem',()=>{
    expect(fixtures.every(f=>Boolean(f.sourceUrl||f.evidence))).toBe(true);
    expect(fixtures.every(f=>Number.isInteger(f.input.viewedYear))).toBe(true);
    expect(fixtures.every(f=>!f.input.timePrecision||f.input.timePrecision.includes('representative time'))).toBe(true);
  });
  it('bao phủ đủ 12 giờ địa chi',()=>{
    expect(new Set(fixtures.map(f=>f.expected.timeBranch)).size).toBe(12);
  });
  it('bao phủ đủ 10 Can năm và 10 Can ngày',()=>{
    expect(new Set(fixtures.map(f=>f.expected.yearCanChi.split(' ')[0])).size).toBe(10);
    expect(new Set(fixtures.map(f=>f.expected.dayCanChi.split(' ')[0])).size).toBe(10);
  });
  it('có cả hai giới tính',()=>{
    expect(new Set(fixtures.map(f=>f.input.gender))).toEqual(new Set(['nam','nu']));
  });
  it('phân biệt fixture đủ 14 sao và fixture chỉ có dữ liệu trung tâm',()=>{
    expect(fixtures.filter(f=>'mainStars' in f.expected).length).toBeGreaterThanOrEqual(9);
    expect(fixtures.filter(f=>'observedMainStars' in f.expected).length).toBeGreaterThanOrEqual(10);
  });
  it('phân biệt fixture gốc và 8 ảnh tháng nhuận tuvidauso.ai.studio mới',()=>{
    expect(fixtures.filter(f=>f.expected.lunar.isLeapMonth).length).toBe(0);
    const leapCaptures=capturedFixtures.filter(f=>f.expectedFromTuviVn.lunar.isLeapMonth);
    expect(leapCaptures).toHaveLength(8);
    expect(new Set(leapCaptures.map(f=>f.expectedFromTuviVn.lunar.year))).toEqual(new Set([2023,2025]));
  });
  it('đạt ít nhất 20 bản đồ 14 chính tinh đầy đủ khi kết hợp hai bộ fixture',()=>{
    const oldComplete=fixtures.filter(f=>'mainStars' in f.expected).length;
    const newComplete=capturedFixtures.filter(f=>Boolean(f.expectedFromTuviVn.mainStars)).length;
    expect(oldComplete).toBe(9);
    expect(newComplete).toBe(14);
    expect(oldComplete+newComplete).toBe(23);
  });
  it.each([['LEAP-03','LEAP-04'],['LEAP-08','LEAP-09']] as const)('%s/%s: ngày 15 và 16 giữ Can Chi tháng và Cục', (day15Id,day16Id)=>{
    const a=capturedFixtures.find(f=>f.id===day15Id)!;
    const b=capturedFixtures.find(f=>f.id===day16Id)!;
    expect(a.expectedFromTuviVn.monthCanChi).toBe(b.expectedFromTuviVn.monthCanChi);
    expect(a.expectedFromTuviVn.bureau).toBe(b.expectedFromTuviVn.bureau);
    expect(a.expectedFromTuviVn.lunar.isLeapMonth).toBe(true);
    expect(b.expectedFromTuviVn.lunar.isLeapMonth).toBe(true);
    expect(a.expectedFromTuviVn.lunar.day).toBe(15);
    expect(b.expectedFromTuviVn.lunar.day).toBe(16);
  });
});

describe('Sao phụ đã khớp ảnh tuvidauso.ai.studio: Khôi/Việt, Hồng Loan, Hỷ, Cô/Quả, Không, Đào Hoa, Phong Cáo, Quốc Ấn, Trù, Thương/Sứ, Đẩu Quân',()=>{
  const inputs=new Map<string,{solarDate:string;time:string;gender:string}>();
  for(const f of fixtures) inputs.set(f.id,f.input as {solarDate:string;time:string;gender:string});
  for(const f of capturedFixtures) inputs.set(f.id,f.input as {solarDate:string;time:string;gender:string});
  it.each(secondaryStars.charts.map(c=>[c.id,c] as const))('%s: vị trí sao phụ khớp ảnh',(id,c)=>{
    const input=inputs.get(id)!;
    const [hour,minute]=parseTime(input.time);
    const chart=buildChart({solarDate:input.solarDate,gender:input.gender as 'nam'|'nu',hour,minute});
    const actual:Record<string,string>={};
    const expected={...c.stars} as Record<string,string>;
    for(const palace of chart.palaces) for(const star of palace.stars) if(star.id in expected) actual[star.id]=EARTHLY_BRANCHES[palace.branch]!;
    expect(actual).toEqual(expected);
  });
  it('Thiên Thương/Sứ không đổi chỗ theo âm dương, giới tính',()=>{
    // Dương Nam TV-001, Âm Nam TV-002, Âm Nữ TV-004, Dương Nữ TV-005 đều giữ Thương=Mệnh+5, Sứ=Mệnh+7.
    for(const id of ['TV-001','TV-002','TV-004','TV-005']){
      const input=inputs.get(id)!;const [hour,minute]=parseTime(input.time);
      const chart=buildChart({solarDate:input.solarDate,gender:input.gender as 'nam'|'nu',hour,minute});
      const at=(sid:string)=>chart.palaces.find(p=>p.stars.some(s=>s.id===sid))!.branch;
      expect(at('thien-thuong')).toBe(mod(chart.menhBranch!+5));
      expect(at('thien-su')).toBe(mod(chart.menhBranch!+7));
    }
  });
  it('Thiên Khôi/Việt ưu tiên cặp đã quan sát trên fixture tuvidauso.ai.studio',()=>{
    const observed:Record<number,[string,string]>={0:['Sửu','Mùi'],1:['Tý','Thân'],2:['Hợi','Dậu'],5:['Tý','Thân'],6:['Ngọ','Dần'],7:['Ngọ','Dần'],9:['Mão','Tỵ']};
    for(const [stem,pair] of Object.entries(observed)){
      const stars=placeYearStemStars(Number(stem));
      const br=(id:string)=>EARTHLY_BRANCHES[stars.find(s=>s.id===id)!.branch];
      expect([br('thien-khoi'),br('thien-viet')]).toEqual(pair);
      expect(stars.find(s=>s.id==='thien-khoi')!.status).toBe('VERIFIED_TUVIVN');
      expect(stars.find(s=>s.id==='thien-viet')!.status).toBe('VERIFIED_TUVIVN');
    }
  });
  it('Thiên Khôi/Việt đủ 10 Can; 3 Can chưa có ảnh chỉ là nội suy candidate',()=>{
    const expected:Record<number,[string,string]>={
      0:['Sửu','Mùi'],1:['Tý','Thân'],2:['Hợi','Dậu'],3:['Hợi','Dậu'],4:['Sửu','Mùi'],
      5:['Tý','Thân'],6:['Ngọ','Dần'],7:['Ngọ','Dần'],8:['Mão','Tỵ'],9:['Mão','Tỵ']
    };
    for(let stem=0;stem<10;stem++){
      const stars=placeYearStemStars(stem);
      const br=(id:string)=>EARTHLY_BRANCHES[stars.find(s=>s.id===id)!.branch];
      expect([br('thien-khoi'),br('thien-viet')]).toEqual(expected[stem]);
      const status=KHOI_VIET_TUVIVN_OBSERVED.has(stem)?'VERIFIED_TUVIVN':'CANDIDATE_SPEC';
      expect(stars.find(s=>s.id==='thien-khoi')!.status).toBe(status);
      expect(stars.find(s=>s.id==='thien-viet')!.status).toBe(status);
    }
  });
  it('Đà La/Kình Dương bản mệnh kẹp hai bên Lộc Tồn theo Can năm sinh',()=>{
    for(let stem=0;stem<10;stem++){
      const stars=placeYearStemStars(stem);
      const branch=(id:string)=>stars.find(s=>s.id===id)!.branch;
      expect(branch('kinh-duong')).toBe(mod(branch('loc-ton')+1));
      expect(branch('da-la')).toBe(mod(branch('loc-ton')-1));
      expect(stars.find(s=>s.id==='da-la')!.scope).toBe('natal');
    }
  });
  it('Phá Toái theo bảng Chi năm sinh, đủ 12 Chi',()=>{
    const expected=[5,1,9,5,1,9,5,1,9,5,1,9];
    for(let branch=0;branch<12;branch++){
      const star=placeYearBranchStars(branch,0,0).find(s=>s.id==='pha-toai')!;
      expect(star.branch).toBe(expected[branch]);
      expect(star.status).toBe('VERIFIED_TUVIVN');
      expect(star.scope).toBe('natal');
    }
  });
  it('Thiên Vu theo tháng âm, đủ 12 tháng',()=>{
    const expected=[5,8,2,11,5,8,2,11,5,8,2,11];
    for(let month=1;month<=12;month++){
      const star=placeMonthStars(month).find(s=>s.id==='thien-vu')!;
      expect(star.branch).toBe(expected[month-1]);
      expect(star.status).toBe('CANDIDATE_SPEC');
      expect(star.note).toContain('Trung Châu');
    }
  });
  it('Phong Cáo: Dần khởi giờ Tý, đếm thuận (bảng 12 giờ)',()=>{
    const expected=['Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi','Tý','Sửu'];
    expected.forEach((name,h)=>expect(EARTHLY_BRANCHES[placeHourStars(h).find(s=>s.id==='phong-cao')!.branch]).toBe(name));
  });
});

describe('Sao lưu niên theo năm xem (công thức ứng viên)',()=>{
  it('2026 Bính Ngọ: an các sao lưu theo Can/Chi năm xem, không thay sao bản mệnh',()=>{
    const annual=placeAnnualStars(2026,5);
    expect(annual.yearCanChi.label).toBe('Bính Ngọ');
    const at=(id:string)=>annual.stars.find(s=>s.id===id)!.branch;
    expect(at('luu-thai-tue')).toBe(6); // Ngọ
    expect(at('luu-thien-khong')).toBe(7); // Mùi, đồng cung Thiếu Dương
    expect(at('luu-loc-ton')).toBe(5); // Tỵ, theo Can Bính
    expect(at('luu-kinh-duong')).toBe(6); // Ngọ, kẹp trước Lộc Tồn
    expect(at('luu-da-la')).toBe(4); // Thìn, kẹp sau Lộc Tồn
    expect(at('luu-tang-mon')).toBe(8); // Thân
    expect(at('luu-bach-ho')).toBe(2); // Dần
    expect(annual.stars.every(s=>s.scope==='annual'&&s.status!=='VERIFIED_TUVIVN')).toBe(true);
    expect(annual.pending).toHaveLength(0);
    expect(at('luu-tuan-khong-1')).toBe(2); // Dần
    expect(at('luu-tuan-khong-2')).toBe(3); // Mão
    expect(at('luu-triet-khong-1')).toBe(4); // Thìn
    expect(at('luu-triet-khong-2')).toBe(5); // Tỵ
    expect(at('luu-van-xuong')).toBe(8); // Thân
    expect(at('luu-van-khuc')).toBe(6); // Ngọ
    expect(at('luu-van-tinh')).toBe(9); // Can năm sinh Kỷ -> Dậu
    expect(at('luu-thien-khoi')).toBe(11); // Can Bính -> Hợi
  });
  it('ngũ hành phụ tinh và độ sáng Thiên Diêu theo các chỉnh sửa đã đối chiếu',()=>{
    expect(STAR_META['bac-si-1']?.element).toBe('thuy'); // Lực Sĩ
    expect(STAR_META['bac-si-11']?.element).toBe('hoa'); // Quan Phủ
    expect(STAR_META['huu-bat']?.element).toBe('thuy');
    expect(STAR_META['thai-tue-7']?.element).toBe('thuy'); // Long Đức
    expect(STAR_META['thien-khoi']?.element).toBe('hoa'); // Lưu Thiên Khôi dùng metadata sao gốc
    expect(getStarBrightness('thien-dieu',11)).toBe('H');
  });
  it('chỉ đặt sao lưu trong 12 địa chi và đổi Can Chi sẽ đổi một số vị trí',()=>{
    const a=placeAnnualStars(2030,0),b=placeAnnualStars(2031,0);
    expect(a.stars.every(s=>s.branch>=0&&s.branch<12)).toBe(true);
    expect(a.stars.find(s=>s.id==='luu-loc-ton')!.branch).not.toBe(b.stars.find(s=>s.id==='luu-loc-ton')!.branch);
    expect(a.stars.find(s=>s.id==='luu-thai-tue')!.branch).not.toBe(b.stars.find(s=>s.id==='luu-thai-tue')!.branch);
  });
  it('Lưu Tứ Hóa bám lên cung chứa sao gốc theo Can năm xem',()=>{
    const branches=new Map<string,number>([['liem-trinh',4],['pha-quan',5],['vu-khuc',6],['thai-duong',7]]);
    const annual=placeAnnualTransformations(0,branches);
    expect(annual.map(s=>[s.id,s.branch])).toEqual([
      ['luu-hoa-loc',4],['luu-hoa-quyen',5],['luu-hoa-khoa',6],['luu-hoa-ky',7]
    ]);
    expect(annual.every(s=>s.scope==='annual')).toBe(true);
  });
  it('buildChart tích hợp scope annual và giữ riêng năm sinh/năm xem',()=>{
    const chart=buildChart({solarDate:'1990-01-01',gender:'nam',hour:10,minute:30,viewedYear:2030});
    expect(chart.yearCanChi.label).toBe('Kỷ Tỵ');
    expect(chart.viewedYear).toBe(2030);
    expect(chart.viewedYearCanChi.label).toBe('Canh Tuất');
    expect(chart.palaces.some(p=>p.stars.some(s=>s.id==='luu-thai-tue'&&s.scope==='annual'))).toBe(true);
    expect(chart.palaces.some(p=>p.stars.some(s=>s.id==='hoa-loc'&&s.scope==='natal'))).toBe(true);
    expect(chart.palaces.some(p=>p.stars.some(s=>s.id==='luu-hoa-loc'&&s.scope==='annual'))).toBe(true);
    const vanTinh=chart.palaces.flatMap(p=>p.stars).find(s=>s.id==='luu-van-tinh')!;
    expect(vanTinh.branch).toBe(9); // Can năm sinh Kỷ -> Dậu
    expect(vanTinh.note).toContain('cố định trên lá số gốc');
  });
  it('Lưu Niên Văn Tinh phụ thuộc Can năm sinh, không phụ thuộc năm xem',()=>{
    const a=placeAnnualStars(2026,0).stars.find(s=>s.id==='luu-van-tinh')!;
    const b=placeAnnualStars(2030,0).stars.find(s=>s.id==='luu-van-tinh')!;
    const c=placeAnnualStars(2026,5).stars.find(s=>s.id==='luu-van-tinh')!;
    expect(a.branch).toBe(5); // Giáp -> Tỵ
    expect(b.branch).toBe(5);
    expect(c.branch).toBe(9); // Kỷ -> Dậu
  });
  it('Lưu Văn Xương và Lưu Văn Khúc khớp bảng Trung Châu đủ 10 Can',()=>{
    const xuong=[5,6,8,9,8,9,11,0,2,3];
    const khuc=[9,8,6,5,6,5,3,2,0,11];
    for(let year=1900;year<=2100;year+=1){
      const cc=yearCanChi(year);
      const annual=placeAnnualStars(year,0);
      expect(annual.stars.find(s=>s.id==='luu-van-xuong')!.branch).toBe(xuong[cc.stem]);
      expect(annual.stars.find(s=>s.id==='luu-van-khuc')!.branch).toBe(khuc[cc.stem]);
    }
  });
  it('mọi placement sao lưu có ID riêng biệt và nằm trong 12 địa chi',()=>{
    const annual=placeAnnualStars(2026,5);
    expect(new Set(annual.stars.map(s=>s.id)).size).toBe(annual.stars.length);
    expect(annual.stars.every(s=>s.branch>=0&&s.branch<12&&s.scope==='annual')).toBe(true);
  });
  it('Lưu Tuần Không tính đúng 6 Giáp tuần và Lưu Triệt Không đủ 10 Can',()=>{
    const expectedXun:Record<string,[string,string]>={
      'Giáp Tý':['Tuất','Hợi'],'Giáp Tuất':['Thân','Dậu'],'Giáp Thân':['Ngọ','Mùi'],
      'Giáp Ngọ':['Thìn','Tỵ'],'Giáp Thìn':['Dần','Mão'],'Giáp Dần':['Tý','Sửu'],
    };
    const xunYears=[1924,1934,1944,1954,1964,1914];
    for(const year of xunYears){
      const cc=yearCanChi(year);
      const annual=placeAnnualStars(year,0);
      const actual=['luu-tuan-khong-1','luu-tuan-khong-2'].map(id=>EARTHLY_BRANCHES[annual.stars.find(s=>s.id===id)!.branch]);
      const startBranch=mod(Math.floor((Array.from({length:60},(_,i)=>i).find(i=>i%10===cc.stem&&i%12===cc.branch)??0)/10)*10);
      const key=`Giáp ${EARTHLY_BRANCHES[startBranch]}`;
      expect(actual).toEqual(expectedXun[key]);
    }
    const triByStem:[string,string][]=[['Thân','Dậu'],['Ngọ','Mùi'],['Thìn','Tỵ'],['Dần','Mão'],['Tý','Sửu'],['Thân','Dậu'],['Ngọ','Mùi'],['Thìn','Tỵ'],['Dần','Mão'],['Tý','Sửu']];
    for(let stem=0;stem<10;stem+=1){
      const year=2000+stem;
      const annual=placeAnnualStars(year,0);
      const branches=['luu-triet-khong-1','luu-triet-khong-2'].map(id=>EARTHLY_BRANCHES[annual.stars.find(s=>s.id===id)!.branch]);
      const viewedStem=annual.yearCanChi.stem;
      expect(branches).toEqual(triByStem[viewedStem]);
    }
  });
});
