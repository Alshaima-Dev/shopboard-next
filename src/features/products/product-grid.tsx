import type { Product } from "./product-types";
import { ProductCard } from "./product-card";
import { InteractiveCatalog } from "./interactive-catalog";
import { CartCatalogRegistration } from "../cart/cart-provider";

interface ProductGridProps {
  products: readonly Product[];
}

// Matches the current 1152px shared shell, 24px gutters, grid gaps and 9px
// card inset (8px padding + 1px border). Revisit when the shell is migrated.
const imageSizes = [
  "(min-width: 1152px) 334px",
  "(min-width: 901px) calc((100vw - 150px) / 3)",
  "(min-width: 701px) calc((100vw - 108px) / 2)",
  "(min-width: 400px) calc((100vw - 100px) / 2)",
  "calc(100vw - 66px)",
].join(", ");

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <CartCatalogRegistration products={products}>
    <InteractiveCatalog
      products={products}
      cards={products.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductCard product={product} imageSizes={imageSizes} />
        </li>
      ))}
    />
    </CartCatalogRegistration>
  );
}
