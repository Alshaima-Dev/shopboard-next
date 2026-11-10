"use client";

import Link from "next/link";
import { useLocalization } from "@/features/i18n/language-provider";

export function Footer() {
  const { t, route } = useLocalization();
  return (
    <footer className="border-t border-foreground/15">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <Link href="/" aria-label={t("home")} className="w-fit text-xl font-semibold tracking-wide">
          <span lang="en" dir="ltr" className="font-sans">YANINDA</span>
        </Link>
        <nav aria-label={route.pages}>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            <li><Link href="/">{route.home}</Link></li>
            <li><Link href="/shop">{route.shop}</Link></li>
            <li><Link href="/about">{route.about}</Link></li>
            <li><Link href="/shipping">{route.shipping}</Link></li>
            <li><Link href="/signup">{route.signup}</Link></li>
          </ul>
        </nav>
        <p>{t("footerTagline")}</p>
        <small>{t("footer", { year: new Date().getFullYear() })}</small>
      </div>
    </footer>
  );
}
