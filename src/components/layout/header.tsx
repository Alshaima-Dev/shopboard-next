"use client";

import Link from "next/link";
import { Navbar } from "./navbar";
import { CartButton } from "@/features/cart/cart-controls";
import { LanguagePicker } from "@/features/i18n/language-picker";
import { useLocalization } from "@/features/i18n/language-provider";

export function Header() {
  const { t } = useLocalization();
  return (
    <header className="border-b border-foreground/15">
      <div dir="ltr" className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-6">
        <Link href="/" aria-label={t("home")} className="text-xl font-semibold tracking-wide">
          <span lang="en" dir="ltr" className="font-sans">YANINDA</span>
        </Link>
        <Navbar />
        <div dir="ltr" className="flex min-w-0 items-center gap-3">
          <LanguagePicker />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
