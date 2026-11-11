"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useCart } from "./cart-context";
import { CartItem } from "./cart-item";
import { useLocalization } from "../i18n/language-provider";


export function CartDialog() {
  const cart = useCart();
  const { t, money } = useLocalization();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pendingFocus = useRef<HTMLElement | string | null>(null);
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (!target) return;
    if (target instanceof HTMLElement && target.isConnected) target.focus();
    else if (typeof target === "string") dialogRef.current?.querySelector<HTMLElement>(target)?.focus();
    else (dialogRef.current?.querySelector<HTMLElement>("#cart-items button") ?? dialogRef.current?.querySelector<HTMLElement>("#keep-shopping"))?.focus();
  });

  return (
    <Modal id="cart" ref={dialogRef} aria-labelledby="cart-title" size="drawer"
      open={cart.isOpen} onOpenChange={(open) => { if (!open) cart.close(); }} restoreFocusTo="#open-cart"
      onClickCapture={(event) => {
        if (!(event.target instanceof Element)) return;
        const button = event.target.closest<HTMLElement>("button");
        if (!button) return;
        if (button.id === "clear-cart") pendingFocus.current = "#confirm-clear";
        else if (button.id === "cancel-clear") pendingFocus.current = "#clear-cart";
        else if (button.id === "confirm-clear") pendingFocus.current = "#keep-shopping";
        else if (button.dataset.change || button.dataset.remove) pendingFocus.current = button;
      }}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id="cart-title" className="font-heading text-2xl text-primary">{t("cartTitle")}</h2>
        <Button id="close-cart" variant="outline" size="sm" aria-label={t("closeBag")} onClick={cart.close}>×</Button>
      </div>
      <div id="cart-items">
        {cart.items.length ? cart.items.map(product => (
          <CartItem key={product.id} product={product} />
        )) : <p className="py-6">{t("emptyCart")}</p>}
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="text-caption">
        {cart.notice && <span key={cart.notice.sequence}>{t(cart.notice.key)}</span>}
      </p>
      {cart.items.length ? (
        <div className="space-y-4 pt-6">
          <div className="flex justify-between gap-4"><span>{t("subtotal")}</span><bdi id="cart-total" className="font-semibold tabular-nums">{money(cart.total)}</bdi></div>
          <p className="text-caption">{cart.total >= 100 ? t("freeShipping") : t("awayShipping", { price: money(100 - cart.total) })}</p>
          <Link href="/checkout" onNavigate={cart.close} className="inline-flex min-h-control-height items-center rounded-control bg-primary px-5 py-3 text-primary-foreground">{t("checkout")}</Link>
          <p className="text-caption">{t("demoNote")}</p>
          <Button id="clear-cart" variant="outline" size="sm" onClick={cart.requestClear}>{t("clearCart")}</Button>
          {cart.confirmClear && (
            <div role="group" aria-labelledby="clear-question" className="space-y-3 rounded-control border border-border p-4">
              <p id="clear-question">{t("clearQuestion")}</p>
              <div className="flex flex-wrap gap-3">
                <Button id="confirm-clear" variant="outline" size="sm" onClick={cart.confirmClearCart}>{t("confirmClear")}</Button>
                <Button id="cancel-clear" variant="outline" size="sm" onClick={cart.cancelClear}>{t("cancel")}</Button>
              </div>
            </div>
          )}
        </div>
      ) : <Button id="keep-shopping" variant="outline" size="sm" onClick={cart.close}>{t("keepShopping")}</Button>}
    </Modal>
  );
}
