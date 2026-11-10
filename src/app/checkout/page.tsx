import "server-only";
import { loadProductCatalog } from "@/features/products/product-catalog";
import { CartCatalogRegistration } from "@/features/cart/cart-provider";
import { CheckoutClient } from "@/features/checkout/checkout-client";

export default async function CheckoutPage() {
  const catalog = await loadProductCatalog();
  return (
    <CartCatalogRegistration products={catalog.products}>
      <CheckoutClient />
    </CartCatalogRegistration>
  );
}
