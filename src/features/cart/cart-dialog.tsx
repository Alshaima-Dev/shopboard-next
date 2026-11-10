"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "./cart-context";
import { CartItem } from "./cart-item";
import { useLocalization } from "../i18n/language-provider";


const buttonClass = "grid min-h-touch-target min-w-touch-target place-items-center rounded-control border border-border px-3 disabled:opacity-45";

export function CartDialog() {
  const cart = useCart();
  const { t, money } = useLocalization();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pendingFocus = useRef<HTMLElement | string | null>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (cart.isOpen && !dialog.open) dialog.showModal();
    if (!cart.isOpen && dialog.open) {
      dialog.close();
      document.getElementById("open-cart")?.focus();
    }
  }, [cart.isOpen]);
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (!target) return;
    if (target instanceof HTMLElement && target.isConnected) target.focus();
    else if (typeof target === "string") dialogRef.current?.querySelector<HTMLElement>(target)?.focus();
    else (dialogRef.current?.querySelector<HTMLElement>("#cart-items button") ?? dialogRef.current?.querySelector<HTMLElement>("#keep-shopping"))?.focus();
  });

  return (
    <dialog id="cart" ref={dialogRef} aria-labelledby="cart-title"
      className="fixed inset-0 m-0 ms-auto h-dvh max-h-dvh w-full max-w-[480px] overflow-y-auto overscroll-contain border border-transparent bg-background p-6 text-foreground shadow-[-10px_0_60px_rgb(62_39_35/0.07)] backdrop:bg-chocolate/44 backdrop:backdrop-blur-[3px] tablet:p-8"
      onCancel={(event) => { event.preventDefault(); cart.close(); }}
      onClose={cart.close}
      onClickCapture={(event) => {
        if (!(event.target instanceof Element)) return;
        const button = event.target.closest<HTMLElement>("button");
        if (!button) return;
        if (button.id === "clear-cart") pendingFocus.current = "#confirm-clear";
        else if (button.id === "cancel-clear") pendingFocus.current = "#clear-cart";
        else if (button.id === "confirm-clear") pendingFocus.current = "#keep-shopping";
        else if (button.dataset.change || button.dataset.remove) pendingFocus.current = button;
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) cart.close();
      }}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id="cart-title" className="font-heading text-2xl text-primary">{t("cartTitle")}</h2>
        <button id="close-cart" type="button" aria-label={t("closeBag")} onClick={cart.close} className={buttonClass}>×</button>
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
          <button id="clear-cart" type="button" onClick={cart.requestClear} className={buttonClass}>{t("clearCart")}</button>
          {cart.confirmClear && (
            <div role="group" aria-labelledby="clear-question" className="space-y-3 rounded-control border border-border p-4">
              <p id="clear-question">{t("clearQuestion")}</p>
              <div className="flex flex-wrap gap-3">
                <button id="confirm-clear" type="button" onClick={cart.confirmClearCart} className={buttonClass}>{t("confirmClear")}</button>
                <button id="cancel-clear" type="button" onClick={cart.cancelClear} className={buttonClass}>{t("cancel")}</button>
              </div>
            </div>
          )}
        </div>
      ) : <button id="keep-shopping" type="button" onClick={cart.close} className={buttonClass}>{t("keepShopping")}</button>}
    </dialog>
  );
}
