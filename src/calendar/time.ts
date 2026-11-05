import { mod } from '../engine/constants.js';
export function hourBranchFromTime(hour:number,minute:number):number {
  if(!Number.isInteger(hour)||hour<0||hour>23||!Number.isInteger(minute)||minute<0||minute>59) throw new RangeError('Giờ/phút không hợp lệ');
  return Math.floor((hour*60+minute+60)/120)%12;
}
