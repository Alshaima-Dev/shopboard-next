import { Suspense } from "react";
import { loadProductCatalog } from "@/features/products/product-catalog";
import { ProductGrid } from "@/features/products/product-grid";
import { CatalogFeedback } from "@/features/products/interactive-catalog";
import { RouteText } from "@/features/i18n/language-provider";
import { SignupForm } from "@/features/signup/signup-form";
import { Hero } from "@/features/storefront/hero";
import { Benefits } from "@/features/storefront/benefits";
import { Philosophy } from "@/features/storefront/philosophy";
import { CatalogIntroduction } from "@/features/storefront/catalog-introduction";

async function HomeCatalog() {
  const catalog = await loadProductCatalog();
  return <><CatalogFeedback status={catalog.status} /><ProductGrid products={catalog.products} /></>;
}

export default function HomePage() {
  return <div className="home-storefront -my-12">
    <Hero />
    <Benefits />
    <section id="shop" aria-labelledby="shop-title" className="scroll-mt-[25px] pt-10 tablet:pt-[65px]">
      <CatalogIntroduction />
      <Suspense fallback={<p role="status" className="my-7 text-caption"><RouteText name="loading" /></p>}><HomeCatalog /></Suspense>
    </section>
    <SignupForm />
    <Philosophy />
  </div>;
}
