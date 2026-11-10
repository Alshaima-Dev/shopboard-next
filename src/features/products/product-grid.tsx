import type { Product } from "./product-types";
import { ProductCard } from "./product-card";
import { InteractiveCatalog } from "./interactive-catalog";
import { CartCatalogRegistration } from "../cart/cart-provider";

interface ProductGridProps {
  products: readonly Product[];
  collectionStatus?: "ready" | "error" | "empty";
}

// Shared 1440px container, responsive outer gutters, grid gaps, and
// 18px total card inset (8px padding + 1px border on each side).
const imageSizes = [
  "(min-width: 1552px) 446px",
  "(min-width: 1101px) calc((100vw - 214px) / 3)",
  "(min-width: 901px) calc((100vw - 166px) / 3)",
  "(min-width: 701px) calc((100vw - 124px) / 2)",
  "(min-width: 400px) calc((100vw - 88px) / 2)",
  "calc(100vw - 54px)",
].join(", ");

export function ProductGrid({ products, collectionStatus }: ProductGridProps) {
  return (
    <CartCatalogRegistration products={products}>
    <InteractiveCatalog
      products={products}
      collectionStatus={collectionStatus}
      cards={products.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductCard product={product} imageSizes={imageSizes} />
        </li>
      ))}
    />
    </CartCatalogRegistration>
  );
}
