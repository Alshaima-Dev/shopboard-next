"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { Product } from "../products/product-types";
import { createCartController } from "./cart-controller";
import { CartContext, useCart } from "./cart-context";
import { CartDialog } from "./cart-dialog";
import { useLocalization } from "../i18n/language-provider";

export function CartProvider({ catalog, children }: { catalog: readonly Product[]; children: ReactNode }) {
  const { t } = useLocalization();
  const [controller] = useState(() => createCartController(catalog));
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  useEffect(() => { controller.restoreStorage(); }, [controller]);
  useEffect(() => {
    if (!snapshot.notice) return;
    const timer = setTimeout(controller.dismissNotice, 2600);
    return () => clearTimeout(timer);
  }, [snapshot.notice, controller]);

  return (
    <CartContext.Provider value={{ ...controller, ...snapshot }}>
      {children}
      <CartDialog />
      <div role="status" aria-live="polite" aria-atomic="true" className={snapshot.notice ? "fixed bottom-6 left-1/2 z-50 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-control bg-primary px-5 py-3 text-primary-foreground shadow-card" : "sr-only"}>
        {snapshot.notice && !snapshot.isOpen && <span key={snapshot.notice.sequence}>{t(snapshot.notice.key)}</span>}
      </div>
    </CartContext.Provider>
  );
}

// Bridges validated Server Component props into the browser cart, never fetches.
export function CartCatalogRegistration({ products, children }: { products: readonly Product[]; children: ReactNode }) {
  const { registerProducts } = useCart();
  useEffect(() => { registerProducts(products); }, [registerProducts, products]);
  return children;
}
