import type { Product } from '../products/product-types.ts'
import type { Cart } from '../cart/cart-types.ts'
import { calculateCartCount, calculateCartTotal } from '../cart/cart-logic.ts'


export interface DemoCheckoutReceipt {
  count: number
  subtotal: number
}

// Historical demo summary only. No personal information, order ID, or payment.
export function createDemoCheckoutReceipt(
  catalog: readonly Product[],
  quantities: Readonly<Cart>,
): DemoCheckoutReceipt | undefined {
  const count = calculateCartCount(quantities)
  return count > 0
    ? { count, subtotal: calculateCartTotal(catalog, quantities) }
    : undefined
}

export function completeDemoCheckout(
  catalog: readonly Product[],
  getQuantities: () => Readonly<Cart>,
  resetForm: () => void,
  onComplete: (receipt: DemoCheckoutReceipt) => void,
): boolean {
  const receipt = createDemoCheckoutReceipt(catalog, getQuantities())
  if (!receipt) return false
  resetForm()
  onComplete(receipt)
  return true
}
