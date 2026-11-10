"use client";

import { BrandMark } from "@/components/layout/brand-mark";
import { useLocalization } from "../i18n/language-provider";
import { CampaignImage } from "./campaign-image";

export function Hero() {
  const { t } = useLocalization();
  return (
    <section id="hero" aria-labelledby="hero-title" className="mt-[18px] grid min-w-0 grid-cols-[minmax(0,1fr)] items-center overflow-hidden bg-background tablet:mt-3 tablet:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="flex min-w-0 flex-col items-start justify-center px-7 py-8 tablet:px-6 tablet:py-7 wide:px-12 wide:py-10">
        <span className="text-[10px] leading-[1.7] font-medium tracking-[0.14em] text-primary rtl:tracking-normal">{t("heroEyebrow")}</span>
        <h1 id="hero-title" className="mt-[18px] mb-5 font-display text-hero font-medium text-primary tablet:text-hero-tablet rtl:text-hero-arabic">
          <span>{t("heroFirst")}</span><br /><em className="font-medium rtl:not-italic">{t("heroSecond")}</em>
        </h1>
        <p className="mb-6 max-w-[42ch] text-body rtl:leading-arabic-body">{t("heroDescription")}</p>
        <a href="#shop" className="storefront-primary min-h-control-height gap-6 px-[22px] py-[14px] text-[13px]">
          <span>{t("heroAction")}</span><span aria-hidden="true" className="rtl:-scale-x-100">↗</span>
        </a>
        <div className="mt-6 flex items-center gap-[10px] text-primary">
          <BrandMark className="block h-auto w-7 shrink-0 text-muted-foreground" />
          <span className="text-[11px] leading-[1.7]">{t("heroFoot")}</span>
        </div>
      </div>
      <div className="min-w-0"><CampaignImage /></div>
    </section>
  );
}
