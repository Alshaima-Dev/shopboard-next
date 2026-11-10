"use client";

import { useLocalization } from "../i18n/language-provider";

const benefits = [
  { title: "benefitDesign", description: "benefitDesignText", paths: ["M9 4l1.7 5.3L16 11l-5.3 1.7L9 18l-1.7-5.3L2 11l5.3-1.7L9 4Z", "M19 2v6M16 5h6M19 16v6M16 19h6"] },
  { title: "benefitLast", description: "benefitLastText", paths: ["M5 7h14l1 14H4L5 7Z", "M8 8V6a4 4 0 0 1 8 0v2"] },
  { title: "benefitPersonal", description: "benefitPersonalText", paths: ["M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"] },
  { title: "benefitCare", description: "benefitCareText", paths: ["M12 10C9 2 2 2 2 7c0 5 7 6 10 3Z", "M12 10c3-8 10-8 10-3 0 5-7 6-10 3Z", "M12 10c-1 4-3 7-5 10", "M12 10c1 4 3 7 5 10", "M10.5 10c0-2 3-2 3 0s-3 2-3 0Z"] },
];

export function Benefits() {
  const { t } = useLocalization();
  return <div id="benefits" className="grid grid-cols-2 gap-x-3 gap-y-6 border-b border-border py-[26px] [line-height:normal] tablet:grid-cols-4 tablet:gap-3 tablet:py-8 wide:gap-6">
    {benefits.map(({ title, description, paths }) => <div key={title} className="grid grid-cols-[27px_minmax(0,1fr)] gap-x-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="row-span-2 self-center">{paths.map(d => <path key={d} d={d} />)}</svg>
      <b className="text-[10px] font-medium tablet:text-[11px]">{t(title)}</b>
      <small className="mt-[6px] text-[9px] wide:text-[10px]">{t(description)}</small>
    </div>)}
  </div>;
}
