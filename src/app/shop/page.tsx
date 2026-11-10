import "server-only";
import { loadProductCatalog } from "@/features/products/product-catalog";
import { CatalogIntroduction } from "@/features/storefront/catalog-introduction";
import { ProductGrid } from "@/features/products/product-grid";

export default async function ShopPage() {
  const catalog = await loadProductCatalog();
  return (
    <div className="-my-12">
      <section id="shop" aria-labelledby="shop-title" className="scroll-mt-[25px] pt-10 tablet:pt-[65px]">
        <CatalogIntroduction collectionPage />
        <ProductGrid products={catalog.products} collectionStatus={catalog.status} />
      </section>
    </div>
  );
}
