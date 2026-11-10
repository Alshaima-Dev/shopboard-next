"use client";

import Image from "next/image";
import type { Product } from "./product-types";
import { useLocalization } from "../i18n/language-provider";

export function ProductTitle({ product }: { product: Product }) {
  const { textFor } = useLocalization();
  return <h1 id="product-title" className="text-3xl font-semibold">{textFor(product).name}</h1>;
}

export function ProductInformation({ product }: { product: Product }) {
  const { textFor, t, money } = useLocalization();
  const text = textFor(product);
  return (
    <>
      <Image
        src={`/${product.image.replace(/^\/+/, "")}`}
        alt={text.alt}
        width={480}
        height={480}
        className="h-auto w-full max-w-sm"
        unoptimized
      />
      <p>{text.description}</p>
      <dl className="space-y-2">
        <div><dt className="font-semibold">{t("category")}</dt><dd>{t(product.category)}</dd></div>
        <div><dt className="font-semibold">{t("price")}</dt><dd>{money(product.price)}</dd></div>
      </dl>
    </>
  );
}
