"use client";

import { BrandMark } from "@/components/layout/brand-mark";
import { useLocalization } from "../i18n/language-provider";

export function Philosophy() {
  const { t } = useLocalization();
  return <section id="philosophy" aria-labelledby="philosophy-title" className="mt-[38px] scroll-mt-[25px] rounded-[16px] border border-accent bg-soft px-6 py-12 text-center tablet:px-10 tablet:py-16">
    <BrandMark className="mx-auto mb-5 block h-auto w-10 text-primary" />
    <span className="flex items-center justify-center gap-[14px] text-[10px] leading-normal font-medium tracking-[1.6px] text-primary before:h-px before:w-6 before:bg-coffee after:h-px after:w-6 after:bg-coffee rtl:tracking-normal rtl:leading-[1.9]">{t("philosophyEyebrow")}</span>
    <h2 id="philosophy-title" className="mx-auto my-[18px] max-w-[700px] font-display text-[clamp(36px,4vw,54px)] leading-[1.2] font-medium tracking-[-0.02em] text-primary rtl:text-[clamp(28px,3.5vw,40px)] rtl:leading-[1.7] rtl:tracking-normal">{t("philosophyTitle")}</h2>
    <p className="mx-auto mb-7 max-w-[580px] text-[14px] leading-[1.9] rtl:leading-arabic-body">{t("philosophyText")}</p>
    <a href="#shop" className="storefront-primary gap-6 px-6 py-[14px] text-[14px]"><span className="text-[13px]">{t("discover")}</span><span aria-hidden="true" className="rtl:-scale-x-100">↗</span></a>
  </section>;
}
