"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLink } from "./brand-link";
import { useLocalization } from "@/features/i18n/language-provider";

export function Footer() {
  const { t, route } = useLocalization();
  const pathname = usePathname();
  const links = [
    { href: "/", label: route.home },
    { href: "/shop", label: route.shop },
    { href: "/about", label: route.about },
    { href: "/shipping", label: route.shipping },
    { href: "/signup", label: route.signup },
  ];
  return (
    <footer className="mt-12 shrink-0 [&_a:focus-visible]:outline-primary-foreground">
      <div className="store-container grid grid-cols-[minmax(0,1fr)] gap-4 rounded-t-[16px] bg-primary px-6 pt-9 pb-[max(32px,env(safe-area-inset-bottom))] text-center text-primary-foreground [grid-template-areas:'brand'_'tagline'_'navigation'_'credit'] tablet:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] tablet:gap-x-10 tablet:px-10 tablet:pt-11 tablet:pb-7 tablet:text-start tablet:[grid-template-areas:'brand_navigation'_'tagline_navigation'_'credit_credit']">
        <BrandLink label={t("home")} placement="footer" />
        <nav aria-label={route.pages} className="min-w-0 text-[14px] leading-[1.8] [grid-area:navigation] tablet:self-center">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1 tablet:justify-end">
            {links.map(({ href, label }) => <li key={href}><Link href={href} aria-current={pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)) ? "page" : undefined} className="inline-flex min-h-touch-target items-center decoration-2 underline-offset-4 [@media(hover:hover)_and_(pointer:fine)]:hover:underline">{label}</Link></li>)}
          </ul>
        </nav>
        <p className="font-display text-[20px] leading-[1.6] italic [grid-area:tagline] rtl:text-[14px] rtl:leading-[1.9] rtl:not-italic">{t("footerTagline")}</p>
        <small className="w-full justify-self-center border-t border-primary-foreground/22 pt-5 text-center text-[12px] leading-[1.9] text-primary-muted [grid-area:credit] [overflow-wrap:anywhere]">{t("footer", { year: new Date().getFullYear() })}</small>
      </div>
    </footer>
  );
}
