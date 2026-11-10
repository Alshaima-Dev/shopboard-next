import { isProduct } from './products-api.ts'
import type { ProductsApiOptions } from './products-api.ts'
import type { Product } from './product-types.ts'
import { ApiHttpError, fetchJson } from '../../lib/api/client.ts'

export type ProductDetailsResult =
  | { status: 'ready'; product: Product }
  | { status: 'missing' }
  | { status: 'error' }

export async function fetchProductById(
  id: string,
  options: ProductsApiOptions = {},
): Promise<ProductDetailsResult> {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)))
    return { status: 'missing' }
  try {
    const value = await fetchJson(`/api/products/${id}`, options)
    return isProduct(value) && value.id === Number(id)
      ? { status: 'ready', product: value }
      : { status: 'error' }
  } catch (error: unknown) {
    return error instanceof ApiHttpError && error.status === 404
      ? { status: 'missing' }
      : { status: 'error' }
  }
}
