import type { Language } from '../products/product-types.ts'
import type {
  CheckoutErrorCode,
  CheckoutFieldName,
} from './checkout-schema.ts'

interface CheckoutMessages {
  title: string
  demo: string
  formTitle: string
  fields: Record<CheckoutFieldName, string>
  requiredNote: string
  acknowledge: string
  submit: string
  submitting: string
  empty: string
  successTitle: string
  success: string
  summary: string
  items: string
  restart: string
  back: string
  errors: Record<CheckoutErrorCode, string>
}

export const checkoutMessages: Record<Language, CheckoutMessages> = {
  en: {
    title: 'Review your selection',
    demo: 'Online ordering is not available yet. Use sample details to review the form; nothing is sent or saved, and no payment is collected.',
    formTitle: 'Contact and delivery details',
    fields: {
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone (optional)',
      address: 'Street address',
      city: 'City',
      postalCode: 'Postal code',
      country: 'Country',
    },
    requiredNote: 'All fields except phone are required.',
    acknowledge:
      'I understand that reviewing these details does not place an order or take payment.',
    submit: 'Review details',
    submitting: 'Checking your details…',
    empty: 'Your bag is empty. Add a product before starting checkout.',
    successTitle: 'Your details have been reviewed',
    success:
      'Your details passed the checks. No order was placed, no payment was taken, and no delivery was arranged. Your bag is unchanged; contact and address details were not sent or saved.',
    summary: 'Your selection',
    items: 'Items reviewed',
    restart: 'Review again',
    back: 'Back to shop',
    errors: {
      name: 'Enter a name with at least two characters.',
      email: 'Enter a valid email address.',
      phone:
        'Enter a phone number with at least seven digits, or leave it blank.',
      address: 'Enter an address with at least three characters.',
      required: 'Complete this field.',
      country: 'Enter a country with at least two characters.',
      tooLong: 'This value is too long. Please shorten it.',
      demoRequired: 'Confirm that no order or payment will be processed.',
      invalid: 'Check this field and try again.',
    },
  },
  ar: {
    title: 'مراجعة اختياراتك',
    demo: 'الطلب عبر الموقع غير متاح حاليًا. استخدم بيانات افتراضية لمراجعة النموذج؛ لا تُرسل البيانات ولا تُحفظ ولا تُحصّل أي مبالغ.',
    formTitle: 'بيانات الاتصال والتوصيل',
    fields: {
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف (اختياري)',
      address: 'عنوان الشارع',
      city: 'المدينة',
      postalCode: 'الرمز البريدي',
      country: 'الدولة',
    },
    requiredNote: 'جميع الحقول مطلوبة باستثناء الهاتف.',
    acknowledge: 'أفهم أن مراجعة البيانات لا تعني إرسال طلب أو دفع أي مبلغ.',
    submit: 'مراجعة البيانات',
    submitting: 'جارٍ التحقق من بياناتك…',
    empty: 'سلتك فارغة. أضف قطعة قبل مراجعة اختياراتك.',
    successTitle: 'تمت مراجعة بياناتك',
    success:
      'بياناتك صحيحة. لم يُرسل طلب، ولم يُحصّل أي مبلغ أو يُرتّب توصيل. بقيت سلتك كما هي، ولم تُرسل بيانات الاتصال والعنوان أو تُحفظ.',
    summary: 'اختياراتك',
    items: 'القطع التي تمت مراجعتها',
    restart: 'المراجعة مرة أخرى',
    back: 'العودة إلى المتجر',
    errors: {
      name: 'أدخل اسمًا من حرفين على الأقل.',
      email: 'أدخل بريدًا إلكترونيًا صالحًا.',
      phone: 'أدخل رقم هاتف من سبعة أرقام على الأقل أو اتركه فارغًا.',
      address: 'أدخل عنوانًا من ثلاثة أحرف على الأقل.',
      required: 'أكمل هذا الحقل.',
      country: 'أدخل دولة من حرفين على الأقل.',
      tooLong: 'هذه القيمة طويلة جدًا. يرجى اختصارها.',
      demoRequired:
        'يرجى تأكيد فهمك بأن هذه الخطوة لا ترسل طلبًا ولا تحصّل أي مبلغ.',
      invalid: 'تحقق من هذا الحقل وحاول مجددًا.',
    },
  },
  tr: {
    title: 'Seçiminizi inceleyin',
    demo: 'İnternet üzerinden sipariş henüz verilemiyor. Formu örnek bilgilerle inceleyebilirsiniz; hiçbir bilgi gönderilmez veya kaydedilmez, ödeme alınmaz.',
    formTitle: 'İletişim ve teslimat bilgileri',
    fields: {
      fullName: 'Ad soyad',
      email: 'E-posta',
      phone: 'Telefon (isteğe bağlı)',
      address: 'Sokak adresi',
      city: 'Şehir',
      postalCode: 'Posta kodu',
      country: 'Ülke',
    },
    requiredNote: 'Telefon dışındaki tüm alanlar zorunludur.',
    acknowledge:
      'Bu incelemenin sipariş oluşturmadığını ve ödeme alınmayacağını anlıyorum.',
    submit: 'Bilgileri incele',
    submitting: 'Bilgileriniz kontrol ediliyor…',
    empty: 'Çantanız boş. Devam etmeden önce bir ürün ekleyin.',
    successTitle: 'Bilgileriniz incelendi',
    success:
      'Bilgileriniz doğrulandı. Sipariş verilmedi, ödeme alınmadı ve teslimat düzenlenmedi. Sepetiniz değişmedi; iletişim ve adres bilgileriniz gönderilmedi veya kaydedilmedi.',
    summary: 'Seçiminiz',
    items: 'İncelenen ürün adedi',
    restart: 'Yeniden incele',
    back: 'Mağazaya dön',
    errors: {
      name: 'En az iki karakterli bir ad girin.',
      email: 'Geçerli bir e-posta adresi girin.',
      phone: 'En az yedi rakamlı bir telefon girin veya boş bırakın.',
      address: 'En az üç karakterli bir adres girin.',
      required: 'Bu alanı doldurun.',
      country: 'En az iki karakterli bir ülke girin.',
      tooLong: 'Bu değer çok uzun. Lütfen kısaltın.',
      demoRequired:
        'Sipariş oluşturulmayacağını ve ödeme alınmayacağını onaylayın.',
      invalid: 'Bu alanı kontrol edip tekrar deneyin.',
    },
  },
}

export function checkoutErrorMessage(
  code: string | undefined,
  language: Language,
): string | undefined {
  if (!code) return undefined
  const errors = checkoutMessages[language].errors
  return (
    Object.entries(errors).find(([key]) => key === code)?.[1] ?? errors.invalid
  )
}
