"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { createLanguageController } from "./language-store";
import { applyDocumentLanguage } from "./language-document";
import { formatNumber, formatPrice, getProductText, translate } from "./i18n";
import type { TranslationValues } from "./i18n";
import type { Product } from "../products/product-types";
import { routeMessages } from "./route-messages";
import { catalogMessages } from "./catalog-messages";

const LanguageContext = createContext<ReturnType<typeof createLanguageController> | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [controller] = useState(createLanguageController);
  const language = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  const pathname = usePathname();
  useEffect(() => { controller.restore(); }, [controller]);
  useEffect(() => { applyDocumentLanguage(document, language); }, [language, pathname]);
  return <LanguageContext.Provider value={controller}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const controller = useContext(LanguageContext);
  if (!controller) throw new Error("Localized UI requires LanguageProvider");
  // Each streamed consumer must hydrate with the server's EN snapshot even
  // when the root has already restored a saved language before it arrives.
  const language = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);
  return { language, setLanguage: controller.setLanguage };
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
