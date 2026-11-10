import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { fontVariables } from "./fonts";
import { CatalogProvider } from "@/features/products/catalog-provider";
import { CartProvider } from "@/features/cart/cart-provider";
import { products } from "@/features/products/product-data";
import { LanguageProvider, RouteText } from "@/features/i18n/language-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopBoard",
  description: "ShopBoard application",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <body className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased">
        <LanguageProvider>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:bg-background focus:p-4">
          <RouteText name="skip" />
        </a>
        <CartProvider catalog={products}>
        <CatalogProvider>
          <Header />
          <main id="main-content" tabIndex={-1} className="store-container flex-1 py-12">
            {children}
          </main>
          <Footer />
        </CatalogProvider>
        </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
