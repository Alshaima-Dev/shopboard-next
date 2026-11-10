"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Language } from "../products/product-types";
import { createLanguageController } from "./language-store";
import { applyDocumentLanguage } from "./language-document";
import { formatNumber, formatPrice, getProductText, translate } from "./i18n";
import type { TranslationValues } from "./i18n";
import type { Product } from "../products/product-types";
import { routeMessages } from "./route-messages";
import { catalogMessages } from "./catalog-messages";

const LanguageContext = createContext<{ language: Language; setLanguage: (value: unknown) => void } | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [controller] = useState(createLanguageController);
  const language = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  const pathname = usePathname();
  useEffect(() => { controller.restore(); }, [controller]);
  useEffect(() => { applyDocumentLanguage(document, language); }, [language, pathname]);
  return <LanguageContext.Provider value={{ language, setLanguage: controller.setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("Localized UI requires LanguageProvider");
  return context;
}

export function useLocalization() {
  const context = useLanguage();
  const { language } = context;
  return {
    ...context,
    t: (key: string, values?: TranslationValues) => translate(language, key, values),
    money: (value: number) => formatPrice(value, language),
    number: (value: number) => formatNumber(value, language),
    textFor: (product: Product) => getProductText(product, language),
    route: routeMessages[language],
    catalogText: catalogMessages[language],
  };
}

export function RouteText({ name }: { name: keyof typeof routeMessages.en }) {
  return useLocalization().route[name];
}
