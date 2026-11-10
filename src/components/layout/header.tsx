"use client";

import { BrandLink } from "./brand-link";
import { Navbar } from "./navbar";
import { CartButton } from "@/features/cart/cart-controls";
import { LanguagePicker } from "@/features/i18n/language-picker";
import { useLocalization } from "@/features/i18n/language-provider";

export function Header() {
  const { t, money } = useLocalization();
  return (
    <>
    <div className="store-container mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-[3px] rounded-control bg-primary px-4 py-2 text-center text-[11px] leading-[1.7] text-primary-foreground tablet:gap-x-6 tablet:py-[9px] tablet:text-[12px]">
      <span className="max-w-full [overflow-wrap:break-word]">{t("announcement")}</span>
      <span id="shipping-offer" className="max-w-full basis-full [overflow-wrap:break-word] tablet:basis-auto">{t("shippingOffer", { price: money(100) })}</span>
    </div>
    <header>
      <div className="store-container grid min-h-[100px] grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-2 gap-y-3 py-4 [grid-template-areas:'brand_actions'_'nav_nav'] tablet:grid-cols-[auto_minmax(0,1fr)_auto] tablet:grid-rows-1 tablet:gap-5 tablet:[grid-template-areas:'brand_nav_actions']">
        <BrandLink label={t("home")} placement="header" />
        <Navbar />
        <div dir="ltr" className="flex min-w-0 items-center justify-self-end gap-1 [grid-area:actions] tablet:gap-3">
          <LanguagePicker />
          <CartButton />
        </div>
      </div>
    </header>
    </>
  );
}
