/** Julian day number for Gregorian date, integer at local noon convention. */
export function julianDayNumber(day:number, month:number, year:number):number {
  const a = Math.floor((14-month)/12);
  const y = year + 4800 - a;
  const m = month + 12*a - 3;
  return day + Math.floor((153*m+2)/5) + 365*y + Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400) - 32045;
}
