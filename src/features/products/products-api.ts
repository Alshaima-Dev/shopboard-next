import type {
  Category,
  Language,
  Product,
  ProductTranslation,
} from './product-types.ts'
import {
  ApiHttpError,
  ApiJsonError,
  ApiTimeoutError,
  DEFAULT_API_TIMEOUT_MS,
  fetchJson,
} from '../../lib/api/client.ts'

import type { ApiFetcher, FetchJsonOptions } from '../../lib/api/client.ts'

export type ProductsApiFetcher = ApiFetcher

export const PRODUCTS_API_ENDPOINT = '/api/products'
export const PRODUCTS_API_TIMEOUT_MS = DEFAULT_API_TIMEOUT_MS

export type ProductsApiError =
  'http' | 'invalid-response' | 'network' | 'timeout'

export type ProductsApiResult =
  | { ok: true; products: Product[] }
  | { ok: false; error: ProductsApiError; status?: number }

export type ProductsApiOptions = FetchJsonOptions

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isCategory(value: unknown): value is Category {
  return value === 'Accessories' || value === 'Bags' || value === 'Shoes'
}

function isProductTranslation(value: unknown): value is ProductTranslation {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.alt === 'string'
  )
}

function isTranslations(
  value: unknown,
): value is Record<Language, ProductTranslation> {
  return (
    isRecord(value) &&
    isProductTranslation(value.en) &&
    isProductTranslation(value.ar) &&
    isProductTranslation(value.tr)
  )
}

export function isProduct(value: unknown): value is Product {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    Number.isInteger(value.id) &&
    value.id > 0 &&
    typeof value.name === 'string' &&
    isCategory(value.category) &&
    typeof value.price === 'number' &&
    Number.isFinite(value.price) &&
    value.price >= 0 &&
    typeof value.image === 'string' &&
    typeof value.imageAlt === 'string' &&
    isTranslations(value.translations)
  )
}

function areProductIdsUnique(products: readonly Product[]): boolean {
  return new Set(products.map((product) => product.id)).size === products.length
}

function parseProducts(value: unknown): Product[] | undefined {
  if (!Array.isArray(value)) return undefined

  const products: Product[] = []
  for (const product of value) {
    if (!isProduct(product)) return undefined
    products.push(product)
  }

  return areProductIdsUnique(products) ? products : undefined
}

export async function fetchProducts({
  fetcher = globalThis.fetch,
  timeoutMs = PRODUCTS_API_TIMEOUT_MS,
  scenario,
}: ProductsApiOptions = {}): Promise<ProductsApiResult> {
  try {
    const value = await fetchJson(PRODUCTS_API_ENDPOINT, {
      fetcher,
      timeoutMs,
      scenario,
    })
    const products = parseProducts(value)
    return products
      ? { ok: true, products }
      : { ok: false, error: 'invalid-response' }
  } catch (error: unknown) {
    if (error instanceof ApiHttpError)
      return { ok: false, error: 'http', status: error.status }
    if (error instanceof ApiJsonError)
      return { ok: false, error: 'invalid-response' }
    if (error instanceof ApiTimeoutError) return { ok: false, error: 'timeout' }
    return { ok: false, error: 'network' }
  }
}

function hasStableProductIds(
  products: readonly Product[],
  fallback: readonly Product[],
): boolean {
  if (products.length !== fallback.length) return false

  const fallbackIds = new Set(fallback.map((product) => product.id))
  return products.every((product) => fallbackIds.has(product.id))
}

export async function fetchCompleteProducts(
  fallback: readonly Product[],
  options: ProductsApiOptions = {},
): Promise<ProductsApiResult> {
  const result = await fetchProducts(options)
  if (!result.ok || !hasStableProductIds(result.products, fallback)) {
    return result.ok ? { ok: false, error: 'invalid-response' } : result
  }
  return result
}
