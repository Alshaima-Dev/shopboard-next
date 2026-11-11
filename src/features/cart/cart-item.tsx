"use client";

import type { Product } from "../products/product-types";
import { Button } from "@/components/ui/button";
import { ProductPhoto } from "../products/product-photo";
import { useCart } from "./cart-context";
import { useLocalization } from "../i18n/language-provider";

export function CartItem({ product }: { product: Product }) {
  const cart = useCart();
  const { t, money, number, textFor } = useLocalization();
  const copy = textFor(product);
  const name = copy.name;
  const price = money(product.price);
  return (
    <article className="flex gap-4 border-b border-border py-6">
      <div className="w-[85px] shrink-0">
        <ProductPhoto key={product.image} image={product.image} alt={copy.alt} unavailable={t("imageUnavailable", { name })} sizes="85px" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-primary">{name}</h3>
        <p className="my-2 text-caption">{price}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" data-change={product.id} aria-label={t("decrease", { name })} onClick={() => cart.changeQuantity(product.id, -1)}>−</Button>
          <span aria-label={t("quantity", { name, count: number(cart.quantities[product.id]) })} className="min-w-5 text-center tabular-nums">{number(cart.quantities[product.id])}</span>
          <Button variant="outline" size="sm" data-change={product.id} aria-label={t("increase", { name })} onClick={() => cart.changeQuantity(product.id, 1)}>+</Button>
          <Button variant="outline" size="sm" data-remove={product.id} aria-label={t("removeItem", { name })} onClick={() => cart.removeItem(product.id)}>{t("remove")}</Button>
        </div>
      </div>
    </article>
  );
}
