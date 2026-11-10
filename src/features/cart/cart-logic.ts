import type { Product } from '../products/product-types.ts'
import type { Cart } from './cart-types.ts'

export function calculateCartCount(cart: Cart): number {
  return Object.values(cart).reduce((count, quantity) => count + quantity, 0)
}

export function calculateCartTotal(
  products: readonly Product[],
  cart: Cart,
): number {
  return products.reduce(
    (total, product) => total + product.price * (cart[product.id] || 0),
    0,
  )
}
