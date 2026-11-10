import type { Product } from '../products/product-types.ts'
import type { Cart, CartStorage } from './cart-types.ts'

export const MAX_CART_QUANTITY = 99

// Preserve the existing key so saved shopping bags survive this refactor.
const STORAGE_KEY = 'shopboard-catalog-cart-v2'

function isStoredObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function createCartStore(
  catalog: readonly Product[],
  storage?: CartStorage | null,
) {
  if (storage === undefined) {
    try {
      storage = globalThis.localStorage
    } catch {
      storage = null
    }
  }

  const validIds = new Set(catalog.map((product) => String(product.id)))
  let cart: Cart = {}

  try {
    const saved: unknown = JSON.parse(storage?.getItem(STORAGE_KEY) || '{}')
    for (const id of validIds) {
      const quantity =
        isStoredObject(saved) && id in saved ? saved[id] : undefined
      if (
        typeof quantity === 'number' &&
        Number.isInteger(quantity) &&
        quantity > 0
      ) {
        cart[id] = Math.min(MAX_CART_QUANTITY, quantity)
      }
    }
  } catch {
    // A corrupt saved bag or unavailable storage should not stop the shop.
  }

  function save() {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // The in-memory cart still works if browser storage is blocked or full.
    }
  }

  function changeQuantity(id: string | number | undefined, step: number) {
    id = String(id)
    if (!validIds.has(id) || !Number.isInteger(step)) return
    const quantity = Math.min(MAX_CART_QUANTITY, (cart[id] || 0) + step)
    if (quantity > 0) cart[id] = quantity
    else delete cart[id]
    save()
  }

  return {
    // Give callers a copy so only state functions can change the saved cart.
    getCart: () => ({ ...cart }),
    addItem: (id: string | number | undefined) => changeQuantity(id, 1),
    changeQuantity,
    clearCart() {
      cart = {}
      save()
    },
    removeItem(id: string | number | undefined) {
      delete cart[String(id)]
      save()
    },
  }
}
