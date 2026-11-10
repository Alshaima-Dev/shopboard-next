import type { Product, Category } from './product-types.ts'

import { getLanguage, getProductText } from "../i18n/i18n.ts"

export const AFFORDABLE_PRICE_LIMIT = 50

// Pure functions: inputs in, results out. No DOM, storage, or input mutation.
export function searchProducts(
  products: readonly Product[],
  query = '',
  language = 'en',
): Product[] {
  const normalize = (value: string) => {
    const text = value
      .normalize('NFC')
      .trim()
      .toLocaleLowerCase(getLanguage(language))
    return language === 'ar'
      ? text.replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      : text
  }
  const text = normalize(query)
  return products.filter((product) =>
    normalize(getProductText(product, language).name).includes(text),
  )
}

export function filterByCategory(
  products: readonly Product[],
  category = '',
): Product[] {
  return products.filter(
    (product) => !category || product.category === category,
  )
}

export function sortByPrice(
  products: readonly Product[],
  order = 'featured',
): Product[] {
  const sorted = [...products]
  if (order === 'low') sorted.sort((a, b) => a.price - b.price)
  if (order === 'high') sorted.sort((a, b) => b.price - a.price)
  return sorted
}

export function selectProducts(
  products: readonly Product[],
  {
    query = '',
    category = '',
    sort = 'featured',
    affordableOnly = false,
    language = 'en',
  } = {},
): Product[] {
  const filtered = filterByCategory(
    searchProducts(products, query, language),
    category,
  ).filter(
    (product) => !affordableOnly || product.price < AFFORDABLE_PRICE_LIMIT,
  )
  return sortByPrice(filtered, sort)
}

export function getCategories(products: readonly Product[]): Category[] {
  return [...new Set(products.map((product) => product.category))]
}
