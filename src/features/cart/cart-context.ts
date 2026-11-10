"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import type { createCartController, CartSnapshot } from "./cart-controller";
import { calculateCartCount, calculateCartTotal } from "./cart-logic";

export const CartContext = createContext<(ReturnType<typeof createCartController> & CartSnapshot) | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("Cart controls require CartProvider");
  const snapshot = useSyncExternalStore(context.subscribe, context.getSnapshot, context.getServerSnapshot);
  return {
    ...context,
    ...snapshot,
    items: snapshot.catalog.filter(product => snapshot.quantities[product.id]),
    count: calculateCartCount(snapshot.quantities),
    total: calculateCartTotal(snapshot.catalog, snapshot.quantities),
  };
}
