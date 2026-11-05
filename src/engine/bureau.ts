import { mod } from './constants.js';
export interface Bureau { number:2|3|4|5|6; name:'Thủy Nhị Cục'|'Mộc Tam Cục'|'Kim Tứ Cục'|'Thổ Ngũ Cục'|'Hỏa Lục Cục'; element:'Thủy'|'Mộc'|'Kim'|'Thổ'|'Hỏa'; }
export function getBureau(palaceStem:number,palaceBranch:number):Bureau {
  const stemValue=Math.floor(palaceStem/2)+1; // Giáp/Ất=1 ... Nhâm/Quý=5
  const branchValue=([0,0,1,1,2,2,0,0,1,1,2,2] as number[])[mod(palaceBranch,12)]!;
  let s=stemValue+branchValue; if(s>5)s-=5;
  const map:Record<number,Bureau>={1:{number:4,name:'Kim Tứ Cục',element:'Kim'},2:{number:2,name:'Thủy Nhị Cục',element:'Thủy'},3:{number:6,name:'Hỏa Lục Cục',element:'Hỏa'},4:{number:5,name:'Thổ Ngũ Cục',element:'Thổ'},5:{number:3,name:'Mộc Tam Cục',element:'Mộc'}};
  return map[s]!;
}
