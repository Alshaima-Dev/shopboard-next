"use client";

import { useCart } from "./cart-context";
import { useLocalization } from "../i18n/language-provider";
import type { Product } from "../products/product-types";

export function CartButton() {
  const cart = useCart();
  const { t, number } = useLocalization();
  return (
    <button id="open-cart" type="button" disabled={!cart.ready} onClick={cart.open} aria-label={t("openBag", { count: number(cart.count) })} className="flex min-h-touch-target items-center gap-2 rounded-control px-2 disabled:opacity-50">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>
      <span>{t("bag")}</span><span id="count" className="grid size-[23px] place-items-center rounded-full bg-soft text-[10px] text-primary tabular-nums">{number(cart.count)}</span>
    </button>
  );
}

export function AddToCartButton({ product, overlay = false }: { product: Product; overlay?: boolean }) {
  const { t, textFor } = useLocalization();
  const id = product.id;
  const name = textFor(product).name;
  const { addItem, ready } = useCart();
  const label = t("add", { name });
  return (
    <button type="button" data-add={id} disabled={!ready} aria-label={label} title={label} onClick={() => addItem(id)}
      className={overlay
        ? "absolute end-3 bottom-3 grid size-touch-target place-items-center rounded-full border border-transparent bg-background text-primary shadow-card [@media(hover:hover)_and_(pointer:fine)]:hover:bg-primary [@media(hover:hover)_and_(pointer:fine)]:hover:text-primary-foreground enabled:active:bg-primary enabled:active:text-primary-foreground motion-safe:enabled:active:scale-[0.96] motion-safe:transition-[scale,background-color,color] motion-safe:duration-150 motion-safe:ease-out disabled:opacity-45"
        : "min-h-control-height rounded-control bg-primary px-5 py-3 text-primary-foreground disabled:opacity-45"}>
      {overlay ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg> : label}
    </button>
  );
}
