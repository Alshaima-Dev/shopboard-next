import type { Product } from './product-types.ts'
export type { Product, ProductTranslation } from './product-types.ts'

// Stable product identifiers and values; localized display text is separate.
export const products: readonly Product[] = [
  {
    id: 1,
    name: 'Leather Tote Bag',
    category: 'Bags',
    price: 89,
    image: 'images/products/leather-tote-bag.jpg',
    imageAlt:
      'Cognac brown leather tote bag with two long handles on an ivory background',
    translations: {
      en: {
        name: 'Leather Tote Bag',
        description: 'Cognac leather with two long handles.',
        alt: 'Cognac brown leather tote bag with two long handles on an ivory background',
      },
      ar: {
        name: 'حقيبة يد جلدية',
        description: 'حقيبة بلون بني كونياك مع مقبضين طويلين.',
        alt: 'حقيبة يد جلدية، حقيبة بلون بني كونياك مع مقبضين طويلين.',
      },
      tr: {
        name: 'Deri Omuz Çantası',
        description: 'Konyak kahverengisi deri, iki uzun saplı.',
        alt: 'Deri Omuz Çantası. Konyak kahverengisi deri, iki uzun saplı.',
      },
    },
  },
  {
    id: 2,
    name: 'Canvas Backpack',
    category: 'Bags',
    price: 49,
    image: 'images/products/canvas-backpack.jpg',
    imageAlt:
      'Sand beige canvas backpack with tan trim and a front pocket on an ivory background',
    translations: {
      en: {
        name: 'Canvas Backpack',
        description: 'Sand beige canvas with leather trim and a front pocket.',
        alt: 'Sand beige canvas backpack with tan trim and a front pocket on an ivory background',
      },
      ar: {
        name: 'حقيبة ظهر قماشية',
        description: 'قماش بيج رملي بحواف جلدية وجيب أمامي.',
        alt: 'حقيبة ظهر قماشية، قماش بيج رملي بحواف جلدية وجيب أمامي.',
      },
      tr: {
        name: 'Kanvas Sırt Çantası',
        description: 'Kum beji kanvas, deri detaylar ve ön cep.',
        alt: 'Kanvas Sırt Çantası. Kum beji kanvas, deri detaylar ve ön cep.',
      },
    },
  },
  {
    id: 3,
    name: 'Mini Crossbody Bag',
    category: 'Bags',
    price: 39,
    image: 'images/products/mini-crossbody-bag.jpg',
    imageAlt:
      'Dark chocolate mini crossbody bag with a slim shoulder strap on an ivory background',
    translations: {
      en: {
        name: 'Mini Crossbody Bag',
        description: 'Dark brown leather with a slim shoulder strap.',
        alt: 'Dark chocolate mini crossbody bag with a slim shoulder strap on an ivory background',
      },
      ar: {
        name: 'حقيبة كتف صغيرة',
        description: 'جلد بني داكن مع حزام كتف رفيع.',
        alt: 'حقيبة كتف صغيرة، جلد بني داكن مع حزام كتف رفيع.',
      },
      tr: {
        name: 'Mini Çapraz Çanta',
        description: 'İnce omuz askılı, koyu kahverengi deri.',
        alt: 'Mini Çapraz Çanta. İnce omuz askılı, koyu kahverengi deri.',
      },
    },
  },
  {
    id: 4,
    name: 'White Sneakers',
    category: 'Shoes',
    price: 75,
    image: 'images/products/white-sneakers.jpg',
    imageAlt:
      'Pair of white low-top sneakers with white laces and rubber soles on an ivory background',
    translations: {
      en: {
        name: 'White Sneakers',
        description: 'White low-top sneakers with white laces and soles.',
        alt: 'Pair of white low-top sneakers with white laces and rubber soles on an ivory background',
      },
      ar: {
        name: 'حذاء رياضي أبيض',
        description: 'حذاء منخفض برقبة قصيرة وأربطة ونعل أبيض.',
        alt: 'حذاء رياضي أبيض، حذاء منخفض برقبة قصيرة وأربطة ونعل أبيض.',
      },
      tr: {
        name: 'Beyaz Spor Ayakkabı',
        description: 'Beyaz bağcıklı ve tabanlı, kısa bilekli tasarım.',
        alt: 'Beyaz Spor Ayakkabı. Beyaz bağcıklı ve tabanlı, kısa bilekli tasarım.',
      },
    },
  },
  {
    id: 5,
    name: 'Running Shoes',
    category: 'Shoes',
    price: 110,
    image: 'images/products/running-shoes.jpg',
    imageAlt:
      'Pair of charcoal running shoes with sage accents and cushioned ivory soles on an ivory background',
    translations: {
      en: {
        name: 'Running Shoes',
        description: 'Charcoal mesh, sage accents, and cushioned soles.',
        alt: 'Pair of charcoal running shoes with sage accents and cushioned ivory soles on an ivory background',
      },
      ar: {
        name: 'حذاء للجري',
        description: 'نسيج رمادي داكن بلمسات خضراء ونعل مبطن.',
        alt: 'حذاء للجري، نسيج رمادي داكن بلمسات خضراء ونعل مبطن.',
      },
      tr: {
        name: 'Koşu Ayakkabısı',
        description:
          'Adaçayı yeşili detaylı, antrasit file ve yastıklamalı taban.',
        alt: 'Koşu Ayakkabısı. Adaçayı yeşili detaylı, antrasit file ve yastıklamalı taban.',
      },
    },
  },
  {
    id: 6,
    name: 'Suede Loafers',
    category: 'Shoes',
    price: 95,
    image: 'images/products/suede-loafers.jpg',
    imageAlt: 'Pair of camel brown suede penny loafers on an ivory background',
    translations: {
      en: {
        name: 'Suede Loafers',
        description: 'Camel suede in a classic slip-on design.',
        alt: 'Pair of camel brown suede penny loafers on an ivory background',
      },
      ar: {
        name: 'حذاء لوفر من الشمواه',
        description: 'شمواه بني جملي بتصميم كلاسيكي سهل الارتداء.',
        alt: 'حذاء لوفر من الشمواه، شمواه بني جملي بتصميم كلاسيكي سهل الارتداء.',
      },
      tr: {
        name: 'Süet Loafer',
        description: 'Kolay giyilen klasik tasarım, taba süet.',
        alt: 'Süet Loafer. Kolay giyilen klasik tasarım, taba süet.',
      },
    },
  },
  {
    id: 7,
    name: 'Wool Scarf',
    category: 'Accessories',
    price: 25,
    image: 'images/products/wool-scarf.jpg',
    imageAlt:
      'Folded oatmeal wool scarf with fringed ends on an ivory background',
    translations: {
      en: {
        name: 'Wool Scarf',
        description: 'Soft oatmeal wool with fringed ends.',
        alt: 'Folded oatmeal wool scarf with fringed ends on an ivory background',
      },
      ar: {
        name: 'وشاح صوفي',
        description: 'صوف بيج ناعم مع أطراف مزينة بشراشيب.',
        alt: 'وشاح صوفي، صوف بيج ناعم مع أطراف مزينة بشراشيب.',
      },
      tr: {
        name: 'Yün Atkı',
        description: 'Püsküllü uçlara sahip yumuşak bej yün.',
        alt: 'Yün Atkı. Püsküllü uçlara sahip yumuşak bej yün.',
      },
    },
  },
  {
    id: 8,
    name: 'Silver Watch',
    category: 'Accessories',
    price: 150,
    image: 'images/products/silver-watch.jpg',
    imageAlt:
      'Silver analog watch with a stainless steel link bracelet and ivory dial on an ivory background',
    translations: {
      en: {
        name: 'Silver Watch',
        description: 'Silver metal bracelet and an ivory analog dial.',
        alt: 'Silver analog watch with a stainless steel link bracelet and ivory dial on an ivory background',
      },
      ar: {
        name: 'ساعة فضية',
        description: 'ساعة بعقارب وسوار معدني فضي وميناء عاجي.',
        alt: 'ساعة فضية، ساعة بعقارب وسوار معدني فضي وميناء عاجي.',
      },
      tr: {
        name: 'Gümüş Saat',
        description: 'Fildişi kadranlı, gümüş renkli metal bilezikli saat.',
        alt: 'Gümüş Saat. Fildişi kadranlı, gümüş renkli metal bilezikli saat.',
      },
    },
  },
  {
    id: 9,
    name: 'Sunglasses',
    category: 'Accessories',
    price: 35,
    image: 'images/products/sunglasses.jpg',
    imageAlt:
      'Tortoiseshell sunglasses with dark lenses and partially open temples on an ivory background',
    translations: {
      en: {
        name: 'Sunglasses',
        description: 'Tortoiseshell frames with dark lenses.',
        alt: 'Tortoiseshell sunglasses with dark lenses and partially open temples on an ivory background',
      },
      ar: {
        name: 'نظارة شمسية',
        description: 'إطار بني منقوش وعدسات داكنة.',
        alt: 'نظارة شمسية، إطار بني منقوش وعدسات داكنة.',
      },
      tr: {
        name: 'Güneş Gözlüğü',
        description: 'Koyu camlı, kahverengi kaplumbağa desenli çerçeve.',
        alt: 'Güneş Gözlüğü. Koyu camlı, kahverengi kaplumbağa desenli çerçeve.',
      },
    },
  },
  {
    id: 10,
    name: 'Travel Duffel Bag',
    category: 'Bags',
    price: 120,
    image: 'images/products/travel-duffel-bag.jpg',
    imageAlt:
      'Olive canvas travel duffel bag with cognac leather handles on an ivory background',
    translations: {
      en: {
        name: 'Travel Duffel Bag',
        description: 'Olive canvas with cognac leather handles.',
        alt: 'Olive canvas travel duffel bag with cognac leather handles on an ivory background',
      },
      ar: {
        name: 'حقيبة سفر',
        description: 'قماش أخضر زيتوني بمقابض جلدية بنية.',
        alt: 'حقيبة سفر، قماش أخضر زيتوني بمقابض جلدية بنية.',
      },
      tr: {
        name: 'Seyahat Çantası',
        description: 'Kahverengi deri saplı, zeytin yeşili kanvas.',
        alt: 'Seyahat Çantası. Kahverengi deri saplı, zeytin yeşili kanvas.',
      },
    },
  },
  {
    id: 11,
    name: 'Rain Boots',
    category: 'Shoes',
    price: 60,
    image: 'images/products/rain-boots.jpg',
    imageAlt:
      'Pair of dark forest green rubber rain boots on an ivory background',
    translations: {
      en: {
        name: 'Rain Boots',
        description: 'Dark forest green rubber in a mid-calf silhouette.',
        alt: 'Pair of dark forest green rubber rain boots on an ivory background',
      },
      ar: {
        name: 'جزمة مطر',
        description: 'مطاط أخضر داكن مقاوم للماء بطول منتصف الساق.',
        alt: 'جزمة مطر، مطاط أخضر داكن مقاوم للماء بطول منتصف الساق.',
      },
      tr: {
        name: 'Yağmur Çizmesi',
        description: 'Baldır ortasına uzanan, koyu yeşil su geçirmez kauçuk.',
        alt: 'Yağmur Çizmesi. Baldır ortasına uzanan, koyu yeşil su geçirmez kauçuk.',
      },
    },
  },
  {
    id: 12,
    name: 'Leather Belt',
    category: 'Accessories',
    price: 30,
    image: 'images/products/leather-belt.jpg',
    imageAlt:
      'Coiled dark brown leather belt with a brushed silver buckle on an ivory background',
    translations: {
      en: {
        name: 'Leather Belt',
        description: 'Dark brown leather with a rectangular silver buckle.',
        alt: 'Coiled dark brown leather belt with a brushed silver buckle on an ivory background',
      },
      ar: {
        name: 'حزام جلدي',
        description: 'جلد بني داكن مع إبزيم فضي مستطيل.',
        alt: 'حزام جلدي، جلد بني داكن مع إبزيم فضي مستطيل.',
      },
      tr: {
        name: 'Deri Kemer',
        description: 'Dikdörtgen gümüş renkli tokalı koyu kahverengi deri.',
        alt: 'Deri Kemer. Dikdörtgen gümüş renkli tokalı koyu kahverengi deri.',
      },
    },
  },
]
