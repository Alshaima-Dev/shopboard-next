"use client";

import { useCallback } from "react";
import Link from "next/link";
import type { DemoCheckoutReceipt } from "./checkout-logic";
import { useLocalization } from "../i18n/language-provider";
import { checkoutMessages } from "./checkout-messages";

export function CheckoutSuccess({ receipt, onRestart }: { receipt: DemoCheckoutReceipt; onRestart: () => void }) {
  const { language, t, money, number } = useLocalization();
  const text = checkoutMessages[language];
  const focusHeading = useCallback((heading: HTMLHeadingElement | null) => { heading?.focus(); }, []);
  return (
    <section aria-labelledby="checkout-success-title" className="space-y-6">
      <h1 id="checkout-success-title" tabIndex={-1} ref={focusHeading} className="font-heading text-3xl text-primary">{text.successTitle}</h1>
      <p role="status">{text.success}</p>
      <h2 className="font-heading text-2xl text-primary">{text.summary}</h2>
      <dl className="grid max-w-[450px] grid-cols-[minmax(0,1fr)_auto] gap-3">
        <dt>{text.items}</dt><dd>{number(receipt.count)}</dd>
        <dt>{t("subtotal")}</dt><dd><bdi>{money(receipt.subtotal)}</bdi></dd>
      </dl>
      <div className="flex flex-wrap items-center gap-5">
        <Link href="/shop" className="underline underline-offset-4">{text.back}</Link>
        <button type="button" onClick={onRestart} className="min-h-touch-target rounded-control border border-border bg-background px-5 py-[10px]">{text.restart}</button>
      </div>
    </section>
  );
}
