import type { Language } from '../products/product-types.ts'

interface FeedbackMessages {
  pageTitle: string
  pageError: string
  cartTitle: string
  cartError: string
  retry: string
  reload: string
  back: string
}

export const feedbackMessages: Record<Language, FeedbackMessages> = {
  en: {
    pageTitle: 'Let’s find your way back',
    pageError:
      'This page is temporarily unavailable. Try again or return home. Your saved bag stays with you. Reloading clears any unfinished form entries.',
    cartTitle: 'Your bag is temporarily unavailable',
    cartError:
      'Your saved pieces are still here. Try opening your bag again, or review your selection.',
    retry: 'Try again',
    reload: 'Reload page',
    back: 'Back to Home',
  },
  ar: {
    pageTitle: 'لنعد إلى ما تحب',
    pageError:
      'تعذّر عرض هذه الصفحة. حاول مجددًا أو عُد إلى الرئيسية؛ ستبقى القطع المحفوظة في سلتك. إعادة تحميل الصفحة تمسح بيانات النماذج غير المكتملة.',
    cartTitle: 'تعذّر فتح السلة مؤقتًا',
    cartError:
      'القطع المحفوظة في سلتك ما زالت موجودة. حاول فتح السلة مجددًا أو انتقل إلى مراجعتها.',
    retry: 'حاول مرة أخرى',
    reload: 'إعادة تحميل الصفحة',
    back: 'العودة إلى الرئيسية',
  },
  tr: {
    pageTitle: 'Yeniden keşfetmeye başlayın',
    pageError:
      'Bu sayfa şu anda görüntülenemiyor. Tekrar deneyin veya ana sayfaya dönün. Kayıtlı sepetiniz korunur. Sayfayı yeniden yüklemek tamamlanmamış form bilgilerini siler.',
    cartTitle: 'Sepetiniz şu anda açılamıyor',
    cartError:
      'Kayıtlı ürünleriniz korunuyor. Sepeti yeniden açmayı deneyin veya seçiminizi inceleyin.',
    retry: 'Tekrar dene',
    reload: 'Sayfayı yeniden yükle',
    back: 'Ana sayfaya dön',
  },
}
