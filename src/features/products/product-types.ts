export type Category = 'Bags' | 'Shoes' | 'Accessories'
export type Language = 'en' | 'ar' | 'tr'

export interface ProductTranslation {
  name: string
  description: string
  alt: string
}

export interface Product {
  id: number
  name: string
  category: Category
  price: number
  image: string
  imageAlt: string
  translations: Record<Language, ProductTranslation>
}
