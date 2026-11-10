"use client";

import { useCart } from "../cart/cart-context";
import { CartItem } from "../cart/cart-item";
import { useLocalization } from "../i18n/language-provider";

export function CheckoutSummary() {
  const cart = useCart();
  const { t, money } = useLocalization();
  return (
    <aside aria-labelledby="checkout-bag-title" className="min-w-0 space-y-4 rounded-image border border-border bg-soft p-5">
      <h2 id="checkout-bag-title" className="font-heading text-2xl text-primary">{t("cartTitle")}</h2>
      <ul>{cart.items.map(product => <li key={product.id}><CartItem product={product} /></li>)}</ul>
      <div className="flex justify-between gap-4"><span>{t("subtotal")}</span><bdi id="checkout-subtotal" className="font-semibold">{money(cart.total)}</bdi></div>
      <p>{cart.total >= 100 ? t("freeShipping") : t("awayShipping", { price: money(100 - cart.total) })}</p>
    </aside>
  );
}
