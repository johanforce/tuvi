import { buildChart } from './engine/build-chart.js';
import type { ChartCore, StarPlacement } from './engine/types.js';
import { branchName, stemName } from './engine/constants.js';
import { STAR_META, ELEMENT_LABEL } from './catalog/star-metadata.js';

const BR=['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
const GRID:Record<string,[number,number]>={Tỵ:[1,1],Ngọ:[1,2],Mùi:[1,3],Thân:[1,4],Thìn:[2,1],Dậu:[2,4],Mão:[3,1],Tuất:[3,4],Dần:[4,1],Sửu:[4,2],Tý:[4,3],Hợi:[4,4]};
const GROUPS:Record<string,string>={main:'Chính tinh',secondary:'Phụ tinh',misc:'Tạp diệu',spirit:'Thần sát',transformation:'Tứ Hóa',annual:'Sao lưu'};
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let chart:ChartCore|null=null;
let selectedBranch:number|null=null;
let zoom=1;
let activeTab:'overview'|'annual'='overview';
let visible:Record<string,boolean>={main:true,secondary:true,misc:true,spirit:true,transformation:true,annual:true};
const branchIndex=(name:string)=>BR.indexOf(name);
const timeBranch=(v:string)=>{if(!v)return null;const [h,m]=v.split(':').map(Number);const total=h*60+m;return Math.floor(((total+60)%1440)/120)};

function validateAndBuild(){
  const date=$<HTMLInputElement>('date').value;
  const gender=document.querySelector<HTMLInputElement>('input[name="g"]:checked')?.value;
  const time=$<HTMLInputElement>('time').value;
  const unknown=$<HTMLInputElement>('unk').checked;
  const year=Number(date.slice(0,4));
  const viewedYear=Number($<HTMLInputElement>('view-year').value);
  $('e-g').textContent=gender?'':'Hãy chọn giới tính.';
  $('e-d').textContent=date&&year>=1900&&year<=2100?'':(date?'Năm sinh phải nằm trong khoảng 1900–2100.':'Hãy nhập ngày sinh dương lịch.');
  $('e-t').textContent=unknown||time?'':'Hãy nhập giờ sinh hoặc chọn “Không rõ giờ sinh”.';
  $('e-y').textContent=Number.isInteger(viewedYear)&&viewedYear>=1900&&viewedYear<=2100?'':'Năm xem phải nằm trong khoảng 1900–2100.';
  if(!gender||!date||year<1900||year>2100||(!unknown&&!time)||!Number.isInteger(viewedYear)||viewedYear<1900||viewedYear>2100)return;
  try{
    const [hour,minute]=unknown?[undefined,undefined]:time.split(':').map(Number);
    chart=buildChart({name:$<HTMLInputElement>('name').value.trim()||undefined,gender:gender as 'nam'|'nu',solarDate:date,viewedYear,...(unknown?{unknownTime:true}:{hour,minute})});
    selectedBranch=chart.menhBranch??null;
    renderChart();
    show('v-chart');
  }catch(err){$('e-d').textContent=err instanceof Error?err.message:'Không thể lập lá số.';}
}
function show(id:string){['v-form','v-load','v-chart'].forEach(x=>$(x).classList.toggle('hide',x!==id));window.scrollTo(0,0)}
function hourName(i:number){return BR[i]+' thời'}
function statusText(s:StarPlacement){return s.status==='MISSING_RULE'?'Chưa có công thức':'Công thức đã được người dùng xác nhận'}
function isTransformation(s:StarPlacement):boolean{return ['hoa-loc','hoa-quyen','hoa-khoa','hoa-ky'].includes(s.id)||s.id.startsWith('luu-hoa-')}
function starGroup(s:StarPlacement):string{
  if(s.scope==='annual')return 'annual';
  if(isTransformation(s))return 'transformation';
  if(s.id.startsWith('bac-si-')||s.id.startsWith('trang-sinh-')||s.id.startsWith('thai-tue-'))return 'spirit';
  const id=s.id;
  if(['tu-vi','thien-co','thai-duong','vu-khuc','thien-dong','liem-trinh','thien-phu','thai-am','tham-lang','cu-mon','thien-tuong','thien-luong','that-sat','pha-quan'].includes(id))return 'main';
  if(['ta-phu','huu-bat','van-xuong','van-khuc','loc-ton','thien-ma','hoa-tinh','linh-tinh','kinh-duong','da-la','dia-khong','dia-kiep'].includes(id))return 'secondary';
  return 'misc';
}
function starHTML(s:StarPlacement):string{
  const group=starGroup(s);if(!visible[group])return '';
  const meta=STAR_META[s.id];const el=meta?.element;const hoa=isTransformation(s);
  const degree=meta?.brightnessStatus==='VERIFIED'&&meta.brightness?meta.brightness:'?';
  const tip=[s.name,meta?.han||'',el?`Ngũ hành ${ELEMENT_LABEL[el]} (metadata tham khảo, chưa đối chiếu đủ với tuvidauso.ai.studio)`:'Chưa có dữ liệu ngũ hành',meta?.brightnessStatus==='VERIFIED'?`Độ sáng ${degree}`:'Độ sáng chưa được xác minh',statusText(s)].filter(Boolean).join(' · ');
  const cls=['st',group==='main'?'main':'',s.scope==='annual'?'lu':'',hoa?'hoa4':'',el?`e-${el}`:'e-x'].join(' ');
  return `<span class="${cls}" tabindex="0" title="${esc(tip)}" data-tip="${esc(tip)}">${esc(s.name)}${meta?.han?` <i>${esc(meta.han)}</i>`:''}<b class="br" aria-label="Độ sáng">(${degree})</b>${hoa?'<b class="br">'+esc(s.name.replace('Hóa ','H.'))+'</b>':''}</span>`;
}
function palaceByBranch(branch:number){return chart!.palaces.find(p=>p.branch===branch)!}
function palaceHTML(branch:number):string{
  const p=palaceByBranch(branch);const [r,c]=GRID[BR[branch]]!;
  const stars=p.stars.filter(s=>!isTransformation(s));
  const main=stars.filter(s=>starGroup(s)==='main');
  const other=stars.filter(s=>starGroup(s)!=='main');
  const transformations=p.stars.filter(isTransformation);
  const body=chart!.thanBranch===branch;
  const selected=selectedBranch===branch;
  const canChi=`${stemName(p.stem)} ${branchName(branch)}`;
  const groups=[...main,...other,...transformations].map(starHTML).join('');
  const noHour=chart!.timeBranch===undefined;
  const daHan=chart!.greatFortune?.branch===branch?'ĐV.MỆNH':'';
  const luuNien=chart!.luuNienPalaces?.find(x=>x.branch===branch)?.name||'';
  const monthLimit=chart!.monthLimitPalaces?.find(x=>x.branch===branch)?.label||'';
  const layerLabels=[daHan,luuNien,monthLimit].filter(Boolean).join(' · ');
  return `<button class="cell ${selected?'sel':''}" style="grid-area:${r}/${c}" data-b="${branch}" aria-pressed="${selected}" aria-label="Cung ${esc(p.name)} ${esc(canChi)}">
    <div class="ch"><span class="nm">${esc(p.name.toUpperCase())}${body?'<span class="body">THÂN</span>':''}</span><span class="cc">${esc(canChi)} · ${esc(BR[branch])}</span></div>
    <div class="cols"><div class="mains">${main.length?main.map(starHTML).join(''):(noHour?'Chưa xác định giờ':'Vô chính diệu')}</div>${other.map(starHTML).join('')}${transformations.map(starHTML).join('')}</div>
    <div class="cf"><span class="layers">${esc(layerLabels|| (noHour?'Chưa xác định vận tháng/năm':''))}</span><span class="dh">${body?'Thân cư cung này':''}</span></div>
  </button>`;
}
function centerHTML():string{
  const c=chart!;const d=c.input.solarDate.split('-');const solar=`${d[2]}/${d[1]}/${d[0]}`;
  const yangYear=c.yearCanChi.stem%2===0;
  const gender=c.input.gender==='nam'?(yangYear?'Dương Nam':'Âm Nam'):(yangYear?'Dương Nữ':'Âm Nữ');
  const hour=c.timeBranch===undefined?'Chưa xác định':`${c.input.hour!.toString().padStart(2,'0')}:${c.input.minute!.toString().padStart(2,'0')} · ${hourName(c.timeBranch)}`;
  const rows:[string,string][]=[['Họ tên',c.input.name||'—'],['Giới tính',gender],['Dương lịch',solar],['Âm lịch',`${c.lunar.day}/${c.lunar.month}${c.lunar.isLeapMonth?' nhuận':''}/${c.lunar.year}`],['Can Chi năm',c.yearCanChi.label],['Can Chi tháng',c.monthCanChi.label],['Can Chi ngày',c.dayCanChi.label],['Can Chi giờ',c.hourCanChi?.label||'Chưa xác định'],['Giờ sinh',hour],['Năm xem',`${c.viewedYear} (${c.viewedYearCanChi.label})`],['Tuổi mụ',String(c.age)],['Tiểu Hạn',BR[c.tieuHanBranch]],['Mệnh',c.menhBranch===undefined?'Chưa xác định':BR[c.menhBranch]],['Thân',c.thanBranch===undefined?'Chưa xác định':BR[c.thanBranch]],['Đại Hạn hiện tại',c.greatFortune?`${BR[c.greatFortune.branch]} · ${c.greatFortune.startAge}–${c.greatFortune.endAge} tuổi`:'Chưa xác định'],['Năm thứ trong Đại Hạn',c.greatFortune?String(c.greatFortune.yearInDecade):'—'],['LN.MỆNH',c.luuNienPalaces?BR[c.luuNienPalaces.find(p=>p.name==='LN.MỆNH')!.branch]:'Chưa xác định'],['Th.1',c.monthLimitPalaces?BR[c.monthLimitPalaces[0]!.branch]:'Chưa xác định giờ sinh'],['Ngũ hành Cục',c.bureau?.name||'Chưa xác định'],['Mệnh Chủ',c.menhChu||'—'],['Thân Chủ',c.thanChu||'—'],['Cân lượng','Chưa có công thức xác minh'],['Lai Nhân Cung','Chưa có công thức xác minh']];
  return `<div class="center"><h3>LÁ SỐ TỬ VI</h3><dl>${rows.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><div class="mk">Các công thức an sao đã được xác nhận.</div></div>`;
}
function renderChart(){if(!chart)return;
  $('board').innerHTML=BR.map((_,i)=>palaceHTML(i)).join('')+centerHTML();
  $('board').style.setProperty('--z',String(zoom));
  $('demo-banner').textContent=`LÁ SỐ ĐANG TÍNH BẰNG ENGINE · Tuổi mụ ${chart.age} · Tiểu Hạn ${BR[chart.tieuHanBranch]} · LN.MỆNH ${chart.luuNienPalaces?BR[chart.luuNienPalaces.find(p=>p.name==='LN.MỆNH')!.branch]:'chưa xác định'} · năm xem ${chart.viewedYear} (${chart.viewedYearCanChi.label}).`;
  $('chart-warnings').innerHTML=chart.warnings.length?`<strong>Lưu ý:</strong><ul>${chart.warnings.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'';
  $('tools').innerHTML=Object.entries(GROUPS).map(([k,v])=>`<label class="chip"><input type="checkbox" data-g="${k}" ${visible[k]?'checked':''}>${v}</label>`).join('')+`<span style="flex:1"></span><button class="btn" data-z="-">−</button><button class="btn" data-z="+">+</button><button class="btn" data-z="0">Fit</button>`;
  activeTab='overview';
  $('legend').innerHTML=`<span><b>?</b> Chưa xác minh độ sáng</span><span><b>H.</b> Tứ Hóa</span>${Object.entries(ELEMENT_LABEL).map(([k,v])=>`<span><i class="sw" style="background:var(--${k})"></i>${v}</span>`).join('')}<span>Di chuột/chạm sao để xem ngũ hành và trạng thái</span>`;
  renderSide();
}
function renderSide(){
  if(activeTab==='overview'){
    $('p-mode').innerHTML=`<h3>Thông tin tính toán</h3><dl class="kv"><dt>Năm xem</dt><dd>${chart!.viewedYear} · ${esc(chart!.viewedYearCanChi.label)}</dd><dt>Tuổi mụ</dt><dd>${chart!.age}</dd><dt>Tiểu Hạn</dt><dd>${BR[chart!.tieuHanBranch]}</dd><dt>Đại Hạn</dt><dd>${chart!.greatFortune?`${BR[chart!.greatFortune.branch]} · ${chart!.greatFortune.startAge}–${chart!.greatFortune.endAge} tuổi`:'Chưa xác định'}</dd><dt>LN.MỆNH</dt><dd>${chart!.luuNienPalaces?BR[chart!.luuNienPalaces.find(p=>p.name==='LN.MỆNH')!.branch]:'Chưa xác định'}</dd><dt>Th.1</dt><dd>${chart!.monthLimitPalaces?BR[chart!.monthLimitPalaces[0]!.branch]:'Cần giờ sinh'}</dd><dt>Sao lưu đã an</dt><dd>${chart!.palaces.reduce((n,p)=>n+p.stars.filter(s=>s.scope==='annual').length,0)} vị trí</dd><dt>Chờ quy tắc an sao</dt><dd>${chart!.annualPendingStars.length} sao</dd><dt>Độ tin cậy</dt><dd>Công thức an sao đã được người dùng xác nhận</dd></dl>`;
  }else{
    const placed=chart!.palaces.flatMap(p=>p.stars.filter(s=>s.scope==='annual').map(s=>({star:s,branch:p.branch}))).sort((a,b)=>a.star.name.localeCompare(b.star.name,'vi'));
    const list=placed.map(({star,branch})=>`<tr><td>${esc(star.name)}</td><td>${esc(BR[branch])}</td><td>${esc(star.note||'Công thức đã được xác nhận')}</td></tr>`).join('');
    const pending=chart!.annualPendingStars.map(s=>`<li><strong>${esc(s.name)}</strong> — ${esc(s.note)}</li>`).join('');
    const noTime=chart!.timeBranch===undefined?'<p class="empty">Không rõ giờ sinh: chưa thể định vị Lưu Tứ Hóa vì chưa có vị trí các sao gốc.</p>':'';
    $('p-mode').innerHTML=`<h3>Lưu niên ${chart!.viewedYear} · ${esc(chart!.viewedYearCanChi.label)}</h3><p class="sub">Các vị trí bên dưới gồm sao an theo năm xem và sao cố định theo Can năm sinh (Lưu Niên Văn Tinh). Công thức an sao đã được người dùng xác nhận.</p>${noTime}<h4>Đã an (${placed.length} vị trí)</h4><div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr><th style="text-align:left">Sao lưu</th><th style="text-align:left">Cung chi</th><th style="text-align:left">Căn cứ / ghi chú</th></tr></thead><tbody>${list}</tbody></table></div><h4>Chưa an (${chart!.annualPendingStars.length} sao)</h4><ul>${pending}</ul><p class="sub">Đổi năm xem trong biểu mẫu và lập lại lá số để cập nhật lớp sao lưu.</p>`;
  }
  $('t-ov').setAttribute('aria-selected',String(activeTab==='overview'));
  $('t-yr').setAttribute('aria-selected',String(activeTab==='annual'));
  if(selectedBranch!==null){const p=palaceByBranch(selectedBranch);$('p-palace').innerHTML=`<h3>${esc(p.name)} · ${esc(BR[p.branch])}</h3><p>${p.stars.map(s=>`${esc(s.name)} — ${esc(statusText(s))}`).join('<br>')||'Chưa có sao được an'}</p>`;}else $('p-palace').innerHTML='Chọn một cung để xem danh sách sao và trạng thái công thức.';
}
function bindEvents(){
  $('form').addEventListener('submit',e=>{e.preventDefault();validateAndBuild()});
  $('clr').addEventListener('click',()=>{($('form') as HTMLFormElement).reset();$<HTMLInputElement>('time').disabled=false;['e-g','e-d','e-t','e-y'].forEach(id=>$(id).textContent='')});
  $('back').addEventListener('click',()=>show('v-form'));
  $('pdf').addEventListener('click',()=>window.print());
  $('board').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-b]');if(!b)return;selectedBranch=Number(b.dataset.b);renderChart();renderSide();const dlg=$<HTMLDialogElement>('dlg');if(!dlg.open)dlg.showModal()});
  $('dlg').addEventListener('click',e=>{if(e.target===$('dlg')||(e.target as HTMLElement).closest('[data-x]'))$<HTMLDialogElement>('dlg').close()});
  $('tools').addEventListener('change',e=>{const el=e.target as HTMLInputElement;if(el.dataset.g){visible[el.dataset.g]=el.checked;renderChart()}});
  $('tools').addEventListener('click',e=>{const z=(e.target as HTMLElement).getAttribute('data-z');if(!z)return;zoom=z==='0'?1:Math.max(.55,Math.min(1.8,zoom+(z==='+'?.1:-.1)));$('board').style.setProperty('--z',String(zoom))});
  $('unk').addEventListener('change',()=>{$('time').toggleAttribute('disabled',$<HTMLInputElement>('unk').checked)});
  $('t-ov').addEventListener('click',()=>{activeTab='overview';renderSide()});
  $('t-yr').addEventListener('click',()=>{activeTab='annual';renderSide()});
}
function init(){
  const br=BR;const hours=['23:00–00:59','01:00–02:59','03:00–04:59','05:00–06:59','07:00–08:59','09:00–10:59','11:00–12:59','13:00–14:59','15:00–16:59','17:00–18:59','19:00–20:59','21:00–22:59'];
  $('hrtbl').innerHTML=br.map((b,i)=>`<span>${b}: ${hours[i]}</span>`).join('');bindEvents();
}
init();
