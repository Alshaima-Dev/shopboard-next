"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCatalogControls } from "@/features/products/catalog-provider";
import { AFFORDABLE_PRICE_LIMIT } from "@/features/products/product-logic";
import { useLocalization } from "@/features/i18n/language-provider";
import { languages } from "@/features/i18n/i18n";

export function Navbar() {
  const pathname = usePathname();
  const { language, t, money } = useLocalization();
  const { state, dispatch } = useCatalogControls();
  const catalogActive = pathname === "/" || pathname === "/shop";
  return (
    <nav aria-label={t("navigation")} dir={languages[language].dir} className="min-w-0 [grid-area:nav] text-[12px] leading-[1.7] rtl:text-[14px]">
      <ul className="flex flex-wrap items-center justify-center gap-x-[22px] gap-y-2 tablet:gap-x-4">
        <li>
          <Link
            id="shop-all"
            href="/shop"
            onNavigate={() => dispatch({ type: "mode", affordableOnly: false })}
            aria-current={catalogActive && !state.affordableOnly ? "true" : undefined}
            className="store-nav-link"
          >
            {t("shopAll")}
          </Link>
        </li>
        <li>
          <Link
            id="affordable-products"
            href="/shop"
            onNavigate={() => dispatch({ type: "mode", affordableOnly: true })}
            aria-current={catalogActive && state.affordableOnly ? "true" : undefined}
            className="store-nav-link"
          >
            {t("underPrice", { price: money(AFFORDABLE_PRICE_LIMIT) })}
          </Link>
        </li>
        <li>
          <Link href="/about" aria-current={pathname === "/about" || pathname.startsWith("/about/") ? "page" : undefined} className="store-nav-link">{t("philosophy")}</Link>
        </li>
      </ul>
    </nav>
  );
}
