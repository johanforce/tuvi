import React from 'react';

export const BrandSeal: React.FC = () => (
  <span
    role="img"
    aria-label="紫微"
    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-2 border-amber-300 bg-[#76151d] text-amber-100 shadow-md shadow-red-950/25"
  >
    <span aria-hidden="true" className="absolute inset-[3px] rounded-[3px] border border-amber-200/70" />
    <span aria-hidden="true" className="z-10 flex flex-col items-center font-serif text-[12px] font-bold leading-[0.95] tracking-wide">
      <span>古紫</span>
      <span>學微</span>
    </span>
  </span>
);
