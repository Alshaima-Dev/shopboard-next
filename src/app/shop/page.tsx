import "server-only";
import { loadProductCatalog } from "@/features/products/product-catalog";
import { RouteText } from "@/features/i18n/language-provider";
import { CatalogFeedback } from "@/features/products/interactive-catalog";
import { ProductGrid } from "@/features/products/product-grid";

export default async function ShopPage() {
  const catalog = await loadProductCatalog();
  return (
    <section aria-labelledby="collection-title" className="space-y-8">
      <h1 id="collection-title" className="text-3xl font-semibold"><RouteText name="shop" /></h1>
      <CatalogFeedback status={catalog.status} />
      <ProductGrid products={catalog.products} />
    </section>
  );
}
