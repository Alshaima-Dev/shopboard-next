import "server-only";
import { notFound } from "next/navigation";
import { fetchProductById } from "@/features/products/product-details-api";
import { ProductInformation, ProductTitle } from "@/features/products/product-information";
import { AddToCartButton } from "@/features/cart/cart-controls";
import { CartCatalogRegistration } from "@/features/cart/cart-provider";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await fetchProductById(id);
  if (result.status === "missing") notFound();
  if (result.status === "error") throw new Error("Product details request failed");

  return (
    <CartCatalogRegistration products={[result.product]}>
    <article aria-labelledby="product-title" className="space-y-6">
      <ProductTitle product={result.product} />
      <ProductInformation product={result.product} />
      <AddToCartButton product={result.product} />
    </article>
    </CartCatalogRegistration>
  );
}
