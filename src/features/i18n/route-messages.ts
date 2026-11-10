import type { Language } from '../products/product-types.ts'

interface RouteMessages {
  home: string
  shop: string
  about: string
  shipping: string
  signup: string
  pages: string
  loading: string
  error: string
  missing: string
  notFound: string
  notFoundDescription: string
  back: string
  retry: string
  detailsTitle: string
  detailsHelp: string
  shippingEyebrow: string
  shippingThreshold: string
  shippingCurrency: string
  shippingCurrencyDescription: string
  shippingAvailability: string
  shippingDescription: string
  shippingDemo: string
  skip: string
}

export const routeMessages: Record<Language, RouteMessages> = {
  en: {
    detailsTitle: 'Product details',
    detailsHelp:
      'Discover more pieces from the collection, or return home to begin again.',
    shippingEyebrow: 'THE FINISHING DETAILS',
    shippingThreshold: 'A little closer to complimentary shipping',
    shippingCurrency: 'Clear prices, one currency',
    shippingCurrencyDescription:
      'All prices and bag subtotals are shown in US dollars. Changing the language changes the display format, not the currency or price.',
    shippingAvailability: 'Before you continue',
    home: 'Home',
    shop: 'Collection',
    about: 'About YANINDA',
    shipping: 'Shipping & delivery',
    signup: 'Sign up',
    pages: 'Explore YANINDA',
    loading: 'Loading…',
    error: 'The product could not be loaded.',
    missing: 'This product is not available.',
    notFound: 'Page not found',
    notFoundDescription:
      'The page you’re looking for is no longer here. Find your next favorite from the YANINDA home page.',
    back: 'Back to Home',
    retry: 'Try again',
    shippingDescription:
      'Your bag keeps the essentials in one place: your selected pieces, subtotal, and progress toward the $100 free-shipping threshold.',
    shippingDemo:
      'Online ordering and delivery are not available yet. No order is submitted, no payment is collected, and no delivery date is reserved.',
    skip: 'Skip to main content',
  },
  ar: {
    detailsTitle: 'تفاصيل القطعة',
    detailsHelp:
      'اكتشف المزيد من قطع التشكيلة أو عُد إلى الرئيسية لتبدأ من جديد.',
    shippingEyebrow: 'تفاصيل تهمّك',
    shippingThreshold: 'خطوة أقرب إلى الشحن المجاني',
    shippingCurrency: 'أسعار واضحة بعملة واحدة',
    shippingCurrencyDescription:
      'تُعرض الأسعار والمجاميع بالدولار الأمريكي. يغيّر اختيار اللغة طريقة عرض المبالغ فقط، دون تغيير العملة أو السعر.',
    shippingAvailability: 'قبل المتابعة',
    home: 'الرئيسية',
    shop: 'التشكيلة',
    about: 'عن يانيندا',
    shipping: 'الشحن والتوصيل',
    signup: 'الحساب',
    pages: 'استكشف يانيندا',
    loading: 'جارٍ التحميل…',
    error: 'تعذّر تحميل المنتج.',
    missing: 'هذا المنتج غير متاح.',
    notFound: 'الصفحة غير موجودة',
    notFoundDescription:
      'الصفحة التي تبحث عنها غير متاحة. عُد إلى الرئيسية واكتشف اختيارات يانيندا.',
    back: 'العودة إلى الرئيسية',
    retry: 'حاول مرة أخرى',
    shippingDescription:
      'كل ما تحتاج إلى مراجعته في سلتك: القطع المختارة، والمجموع الفرعي، والمبلغ المتبقي للوصول إلى حد الشحن المجاني البالغ 100 دولار أمريكي.',
    shippingDemo:
      'الطلب والتوصيل عبر الموقع غير متاحين حاليًا. لا يُرسل أي طلب، ولا تُحصّل أي مبالغ، ولا يُحجز موعد للتوصيل.',
    skip: 'انتقل إلى المحتوى الرئيسي',
  },
  tr: {
    detailsTitle: 'Ürün detayları',
    detailsHelp:
      'Koleksiyondaki diğer parçaları keşfedin veya ana sayfadan yeniden başlayın.',
    shippingEyebrow: 'TAMAMLAYAN DETAYLAR',
    shippingThreshold: 'Ücretsiz kargoya bir adım daha yakın',
    shippingCurrency: 'Net fiyatlar, tek para birimi',
    shippingCurrencyDescription:
      'Tüm fiyatlar ve sepet ara toplamları ABD doları cinsindedir. Dil seçimi yalnızca gösterim biçimini değiştirir; para birimi ve fiyat değişmez.',
    shippingAvailability: 'Devam etmeden önce',
    home: 'Ana sayfa',
    shop: 'Koleksiyon',
    about: 'YANINDA hakkında',
    shipping: 'Kargo ve teslimat',
    signup: 'Kayıt ol',
    pages: 'YANINDA’yı keşfet',
    loading: 'Yükleniyor…',
    error: 'Ürün yüklenemedi.',
    missing: 'Bu ürün mevcut değil.',
    notFound: 'Sayfa bulunamadı',
    notFoundDescription:
      'Aradığınız sayfa şu anda mevcut değil. YANINDA ana sayfasına dönerek yeni favorilerinizi keşfedin.',
    back: 'Ana sayfaya dön',
    retry: 'Tekrar dene',
    shippingDescription:
      'Seçtiğiniz ürünleri, ara toplamı ve 100 ABD doları tutarındaki ücretsiz kargo eşiğine kalan tutarı sepetinizde inceleyin.',
    shippingDemo:
      'İnternet üzerinden sipariş ve teslimat henüz kullanılamıyor. Sipariş gönderilmez, ödeme alınmaz ve teslimat tarihi ayrılmaz.',
    skip: 'Ana içeriğe geç',
  },
}
