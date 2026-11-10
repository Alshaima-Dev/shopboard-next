"use client";

import Link from "next/link";
import type { Product } from "./product-types";
import { ProductPhoto } from "./product-photo";
import { AddToCartButton } from "../cart/cart-controls";
import { useLocalization } from "../i18n/language-provider";

interface ProductCardProps {
  product: Product;
  imageSizes: string;
}

export function ProductCard({ product, imageSizes }: ProductCardProps) {
  const { language, t, money, textFor } = useLocalization();
  const text = textFor(product);
  const price = money(product.price);

  return (
    <article
      lang={language}
      dir={language === "ar" ? "rtl" : "ltr"}
      className="flex min-w-0 flex-col rounded-card border border-transparent bg-background p-card-inset text-start font-sans text-foreground shadow-card [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-card-active focus-within:shadow-card-active"
    >
      <ProductPhoto
        key={product.image}
        image={product.image}
        alt={text.alt}
        unavailable={t("imageUnavailable", { name: text.name })}
        sizes={imageSizes}
      >
        <AddToCartButton product={product} overlay />
      </ProductPhoto>
      <div className="mx-card-copy mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
        <h2 className="min-w-0 flex-[1_1_125px] text-product-title font-medium text-primary [overflow-wrap:anywhere] rtl:leading-[1.8]">
          <Link
            href={`/products/${product.id}`}
            prefetch={false}
            className="[@media(hover:hover)_and_(pointer:fine)]:hover:underline"
          >
            {text.name}
          </Link>
        </h2>
        <bdi className="text-[14px] font-semibold tabular-nums [line-height:normal]">{price}</bdi>
      </div>
      <p className="mx-card-copy mt-[10px] mb-1 text-product-category font-medium">
        {t(product.category)}
      </p>
      <p className="mx-card-copy mb-3 text-product-description rtl:leading-arabic-body">
        {text.description}
      </p>
    </article>
  );
}
