"use client";

import { useLocalization } from "../i18n/language-provider";

export function CatalogIntroduction({ collectionPage = false }: { collectionPage?: boolean }) {
  const { t } = useLocalization();
  const Heading = collectionPage ? "h1" : "h2";
  return <div data-collection-introduction={collectionPage || undefined} className={collectionPage ? "mt-[clamp(24px,5vw,64px)] mb-8 grid gap-x-10 gap-y-2 border-b border-border pb-7 [line-height:normal] tablet:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] tablet:items-end" : "block items-end justify-between tablet:flex"}>
    <div><span className="text-[9px] font-medium tracking-[1.6px] text-primary rtl:tracking-normal">{t("shopEyebrow")}</span>
      <Heading id="shop-title" className={collectionPage ? "mt-3 mb-2 max-w-[18ch] font-display text-[clamp(36px,5vw,58px)] leading-[1.15] font-medium tracking-[-3px] text-balance text-primary wide:tracking-[-4px] rtl:text-heading-arabic rtl:leading-arabic-heading rtl:tracking-normal" : "mt-3 font-heading text-[27px] font-medium tracking-[-1.2px] text-primary [line-height:normal] tablet:text-[32px] rtl:leading-arabic-heading rtl:tracking-normal"}>{t("shopTitle")}</Heading>
    </div>
    <p className={collectionPage ? "max-w-[48ch] text-start text-[15px] leading-[1.85] rtl:leading-arabic-body" : "mt-[13px] mb-[6px] text-[11px]"}>{t("shopDescription")}</p>
  </div>;
}
