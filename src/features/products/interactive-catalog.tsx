"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCatalogControls } from "./catalog-provider";
import { AFFORDABLE_PRICE_LIMIT, getCategories, selectProducts } from "./product-logic";
import type { Product } from "./product-types";
import { useLocalization } from "../i18n/language-provider";

interface InteractiveCatalogProps {
  products: readonly Product[];
  cards: readonly ReactNode[];
}

const controlClassName = "min-h-[46px] w-full min-w-0 rounded-control border border-primary bg-background px-3 py-2 text-input tablet:text-body";

export function CatalogFeedback({ status }: { status: "ready" | "error" | "empty" }) {
  const { catalogText } = useLocalization();
  return status === "ready" ? null : <p role="status">{status === "empty" ? catalogText.empty : catalogText.error}</p>;
}

export function InteractiveCatalog({ products, cards }: InteractiveCatalogProps) {
  const { language, t, number, money, route, catalogText } = useLocalization();
  const { state, dispatch } = useCatalogControls();
  const visible = selectProducts(products, { ...state, language });
  const categories = getCategories(products);
  const cardsById = new Map(products.map((product, index) => [product.id, cards[index]]));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 rtl:grid-cols-1 tablet:rtl:grid-cols-2 wide:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.35fr)]">
        <label htmlFor="product-search" className="col-span-2 min-w-0 space-y-2 rtl:col-span-1 tablet:rtl:col-span-2 wide:col-span-1 wide:rtl:col-span-1">
          <span className="sr-only">{t("search")}</span>
          <input
            id="product-search"
            type="search"
            placeholder={t("searchPlaceholder")}
            value={state.query}
            onChange={(event) => dispatch({ type: "query", value: event.currentTarget.value })}
            className={controlClassName}
          />
        </label>
        <label htmlFor="category" className="min-w-0 space-y-2">
          <span className="block text-caption">{t("category")}</span>
          <select id="category" value={state.category} onChange={(event) => dispatch({ type: "category", value: event.currentTarget.value })} className={controlClassName}>
            <option value="">{t("allCategories")}</option>
            {categories.map((category) => <option key={category} value={category}>{t(category)}</option>)}
          </select>
        </label>
        <label htmlFor="sort" className="min-w-0 space-y-2">
          <span className="block text-caption">{t("sort")}</span>
          <select id="sort" value={state.sort} onChange={(event) => dispatch({ type: "sort", value: event.currentTarget.value })} className={controlClassName}>
            <option value="featured">{t("featured")}</option>
            <option value="low">{t("low")}</option>
            <option value="high">{t("high")}</option>
          </select>
        </label>
      </div>
      <p id="results" aria-live="polite" aria-atomic="true" className="text-caption">
        {t("results", { count: number(visible.length) })}
        {state.affordableOnly ? " · " + t("underPrice", { price: money(AFFORDABLE_PRICE_LIMIT) }) : ""}
      </p>
      {visible.length > 0 ? (
        <ul
          dir={language === "ar" ? "rtl" : "ltr"}
          className="grid grid-cols-1 gap-x-grid-inline gap-y-grid-block catalog:grid-cols-2 tablet:gap-x-grid-inline-tablet tablet:gap-y-grid-block-tablet desktop:grid-cols-3"
        >
          {visible.map((product) => cardsById.get(product.id))}
        </ul>
      ) : (
        <div className="space-y-4">
          <p>{t("noResults")}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="underline underline-offset-4">{route.back}</Link>
            <button type="button" onClick={() => dispatch({ type: "mode", affordableOnly: false })} className="rounded-control border border-primary px-4 py-2">
              {catalogText.reset}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
