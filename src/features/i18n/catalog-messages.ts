import type { Language } from '../products/product-types.ts'

export interface CatalogMessages {
  loading: string
  error: string
  empty: string
  retry: string
  reset: string
  noProducts: string
}

// Customer-facing request states retain the usable collection.
export const catalogMessages: Record<Language, CatalogMessages> = {
  en: {
    loading: 'Refreshing the collection…',
    error:
      'We couldn’t refresh the collection. You can still browse your current selection.',
    empty:
      'There are no new pieces to show right now. Your current collection is still here.',
    retry: 'Try again',
    reset: 'Clear filters',
    noProducts:
      'There are no pieces to show right now. Explore more of YANINDA.',
  },
  ar: {
    loading: 'جارٍ تحديث التشكيلة…',
    error: 'تعذّر تحديث التشكيلة. يمكنك متابعة تصفّح القطع المعروضة.',
    empty:
      'لا تتوفر قطع جديدة للعرض حاليًا. يمكنك متابعة تصفّح التشكيلة الحالية.',
    retry: 'حاول مرة أخرى',
    reset: 'إلغاء عوامل التصفية',
    noProducts: 'لا تتوفر قطع للعرض حاليًا. اكتشف المزيد من عالم يانيندا.',
  },
  tr: {
    loading: 'Koleksiyon yenileniyor…',
    error:
      'Koleksiyon yenilenemedi. Mevcut seçkiyi incelemeye devam edebilirsiniz.',
    empty:
      'Şu anda gösterilecek yeni ürün yok. Mevcut koleksiyonu inceleyebilirsiniz.',
    retry: 'Tekrar dene',
    reset: 'Filtreleri temizle',
    noProducts:
      'Şu anda gösterilecek ürün yok. YANINDA’yı keşfetmeye devam edin.',
  },
}
