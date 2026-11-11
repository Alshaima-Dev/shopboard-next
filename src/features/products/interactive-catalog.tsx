"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCatalogControls } from "./catalog-provider";
import { AFFORDABLE_PRICE_LIMIT, getCategories, selectProducts } from "./product-logic";
import type { Product } from "./product-types";
import { useLocalization } from "../i18n/language-provider";

interface InteractiveCatalogProps {
  products: readonly Product[];
  cards: readonly ReactNode[];
  collectionStatus?: "ready" | "error" | "empty";
}

const collectionControlClassName = "min-h-control-height w-full min-w-0 rounded-control border border-coffee bg-background px-3 py-[10px] text-start text-input";
const primaryClassName = "storefront-primary min-h-[46px] gap-[10px] px-[22px] py-3 text-[14px]";
const secondaryClassName = "inline-flex min-h-[46px] max-w-full cursor-pointer items-center justify-center gap-[10px] rounded-control border border-coffee bg-transparent px-[22px] py-3 text-center text-[14px] leading-[1.6] font-medium text-primary [overflow-wrap:break-word] [touch-action:manipulation] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent motion-safe:transition-[background-color,scale] motion-safe:duration-150 motion-safe:ease-out motion-safe:enabled:active:scale-[0.96] disabled:opacity-50";

function CollectionFallback({ status }: { status: "error" | "empty" }) {
  const { catalogText, route } = useLocalization();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <Card variant="soft" padding="responsive" className="my-5" data-catalog-fallback>
    <p role={status === "error" ? "alert" : "status"} className="mb-[18px] max-w-[65ch] leading-[1.8]">{status === "error" ? catalogText.error : catalogText.empty}</p>
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/" className={primaryClassName}>{route.back}</Link>
      <button type="button" disabled={pending} aria-busy={pending} onClick={() => startTransition(() => router.refresh())} className={secondaryClassName}>{catalogText.retry}</button>
    </div>
    {pending && <p role="status" className="mt-4 text-[13px] leading-[1.8] text-muted-foreground">{catalogText.loading}</p>}
  </Card>;
}

const homeSearchClassName = "min-h-[46px] w-full min-w-0 rounded-control border border-coffee bg-background py-[10px] ps-[42px] pe-[14px] text-input tablet:leading-[1.85]";

export function CatalogFeedback({ status }: { status: "ready" | "error" | "empty" }) {
  const { catalogText } = useLocalization();
  return status === "ready" ? null : <p role="status">{status === "empty" ? catalogText.empty : catalogText.error}</p>;
}

export function InteractiveCatalog({ products, cards, collectionStatus }: InteractiveCatalogProps) {
  const collectionPage = collectionStatus !== undefined;
  const { language, t, number, money, route, catalogText } = useLocalization();
  const { state, dispatch } = useCatalogControls();
  const visible = selectProducts(products, { ...state, language });
  const categories = getCategories(products);
  const cardsById = new Map(products.map((product, index) => [product.id, cards[index]]));
  const emptyContent = <>
    <p className={collectionPage ? "mb-6 text-start text-[16px] leading-[1.8]" : undefined}>{products.length ? t("noResults") : catalogText.noProducts}</p>
    <div className={collectionPage ? "flex flex-wrap items-center gap-3" : "flex flex-wrap gap-4"}>
      <Link href="/" className={collectionPage ? primaryClassName : "underline underline-offset-4"}>{route.back}</Link>
      <button type="button" onClick={() => dispatch({ type: "mode", affordableOnly: false })} className={collectionPage ? secondaryClassName : "rounded-control border border-primary px-4 py-2"}>
        {catalogText.reset}
      </button>
    </div>
  </>;

  return (
    <div className={collectionPage ? undefined : "mt-7 space-y-5"}>
      <div data-catalog-controls={collectionPage || undefined} className={`${collectionPage ? "mt-7 mb-4 items-end" : "[align-items:end]"} grid grid-cols-[minmax(0,1fr)] gap-x-3 gap-y-4 tablet:grid-cols-2 tablet:gap-5 wide:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.35fr)]`}>
        <label htmlFor="product-search" className={collectionPage ? "flex min-h-[46px] min-w-0 items-center gap-[10px] rounded-control border border-coffee bg-background px-[14px] py-[10px] focus-within:outline-2 focus-within:outline-offset-[3px] focus-within:outline-primary tablet:col-span-2 wide:col-span-1" : "relative min-w-0 space-y-2 tablet:col-span-full wide:col-auto"}>
          <span className="sr-only">{t("search")}</span>
          {collectionPage && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="shrink-0 text-primary"><path d="M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0" /></svg>}
          {!collectionPage && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="absolute start-[14px] top-1/2 -translate-y-1/2 text-primary"><path d="M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0" /></svg>}
          <input
            id="product-search"
            type="search"
            placeholder={t("searchPlaceholder")}
            value={state.query}
            onChange={(event) => dispatch({ type: "query", value: event.currentTarget.value })}
            className={collectionPage ? "min-h-6 w-full min-w-0 bg-transparent text-input focus-visible:outline-none" : homeSearchClassName}
          />
        </label>
        <label htmlFor="category" className={collectionPage ? "grid min-w-0 gap-2" : "min-w-0 space-y-2"}>
          <span className={`${collectionPage ? "text-start" : "block"} text-[13px] leading-[1.6] font-medium`}>{t("category")}</span>
          <select id="category" value={state.category} onChange={(event) => dispatch({ type: "category", value: event.currentTarget.value })} className={collectionControlClassName}>
            <option value="">{t("allCategories")}</option>
            {categories.map((category) => <option key={category} value={category}>{t(category)}</option>)}
          </select>
        </label>
        <label htmlFor="sort" className={collectionPage ? "grid min-w-0 gap-2" : "min-w-0 space-y-2"}>
          <span className={`${collectionPage ? "text-start" : "block"} text-[13px] leading-[1.6] font-medium`}>{t("sort")}</span>
          <select id="sort" value={state.sort} onChange={(event) => dispatch({ type: "sort", value: event.currentTarget.value })} className={collectionControlClassName}>
            <option value="featured">{t("featured")}</option>
            <option value="low">{t("low")}</option>
            <option value="high">{t("high")}</option>
          </select>
        </label>
      </div>
      {collectionStatus && collectionStatus !== "ready" && <CollectionFallback status={collectionStatus} />}
      <p id="results" aria-live="polite" aria-atomic="true" className={`${collectionPage ? "" : "mt-4"} mb-5 text-caption`}>
        {t("results", { count: number(visible.length) })}
        {state.affordableOnly ? " · " + t("underPrice", { price: money(AFFORDABLE_PRICE_LIMIT) }) : ""}
      </p>
      {visible.length > 0 ? (
        <ul
          dir={language === "ar" ? "rtl" : "ltr"}
          className="mt-0 grid grid-cols-1 gap-x-grid-inline gap-y-grid-block catalog:grid-cols-2 tablet:gap-x-grid-inline-tablet tablet:gap-y-grid-block-tablet desktop:grid-cols-3"
        >
          {visible.map((product) => cardsById.get(product.id))}
        </ul>
      ) : (
        collectionPage
          ? <Card variant="soft" padding="responsive" data-catalog-empty>{emptyContent}</Card>
          : <div className="space-y-4">{emptyContent}</div>
      )}
    </div>
  );
}
