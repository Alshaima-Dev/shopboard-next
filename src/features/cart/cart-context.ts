"use client";

import { createContext, useContext } from "react";
import type { createCartController, CartSnapshot } from "./cart-controller";
import { calculateCartCount, calculateCartTotal } from "./cart-logic";

export const CartContext = createContext<(ReturnType<typeof createCartController> & CartSnapshot) | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("Cart controls require CartProvider");
  return {
    ...context,
    items: context.catalog.filter(product => context.quantities[product.id]),
    count: calculateCartCount(context.quantities),
    total: calculateCartTotal(context.catalog, context.quantities),
  };
}
